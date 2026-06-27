import json
import logging
from datetime import datetime
from typing import Any

from langchain_openai import ChatOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self) -> None:
        self.provider = settings.ai_provider.lower()
        if self.provider == "openai":
            self.enabled = bool(settings.openai_api_key)
            self.llm = (
                ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.2)
                if self.enabled
                else None
            )
        elif self.provider == "ollama":
            self.enabled = True
            self.llm = ChatOpenAI(
                model=settings.ollama_model,
                api_key="ollama",
                base_url=f"{settings.ollama_base_url}/v1",
                temperature=0.2,
            )
            logger.info("AI provider: Ollama (%s) at %s", settings.ollama_model, settings.ollama_base_url)
        else:
            self.enabled = False
            self.llm = None
            logger.warning("Unknown AI provider '%s' — AI features disabled.", self.provider)

    async def json_prompt(self, system: str, user: str, fallback: dict[str, Any]) -> dict[str, Any]:
        if not self.llm:
            logger.debug("AI disabled, returning fallback.")
            return fallback
        try:
            response = await self.llm.ainvoke(
                [
                    ("system", f"{system}\nReturn ONLY valid JSON with no markdown, no explanation."),
                    ("user", user),
                ]
            )
            content = str(response.content).strip()
            # Strip markdown code block if model wrapped it
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.warning("LLM returned non-JSON: %s", e)
            return fallback | {"raw_response": str(response.content)}  # type: ignore[possibly-undefined]
        except Exception as e:
            logger.error("LLM call failed: %s", e)
            return fallback | {"error": str(e)}

    async def parse_task(self, text: str, reference_time: datetime | None, language: str = "English") -> dict[str, Any]:
        fallback = {
            "task": text[:80],
            "deadline": None,
            "dependency": None,
            "dependency_date": None,
            "priority": "medium",
            "estimated_minutes": 60,
        }
        return await self.json_prompt(
            (
                "You are a task parser. Extract structured fields from the user's natural language input. "
                "Output JSON with keys: task, deadline (ISO8601 or null), dependency (string or null), "
                "dependency_date (ISO8601 or null), priority (low/medium/high/urgent), estimated_minutes (int). "
                f"All text values in the JSON output (such as task and dependency names) MUST be in {language}."
            ),
            f"Reference time: {reference_time or 'now'}. Task description: {text}",
            fallback,
        )

    async def warm_start(self, title: str, context: str | None, language: str = "English") -> dict[str, Any]:
        fallback = {
            "outline": ["Define the goal", "Identify key milestones", "Assess risks", "Take the first action"],
            "first_draft": f"Starter draft for '{title}': Define the outcome, constraints, timeline, and owner.",
            "resources": ["Calendar availability", "Related notes", "Stakeholder inputs"],
            "checklist": ["Clarify objective", "Collect inputs", "Draft", "Review", "Submit"],
        }
        return await self.json_prompt(
            (
                "You are a productivity coach. Create a warm-start package for a task to help the user begin immediately. "
                "Output JSON with keys: outline (list of strings), first_draft (string), resources (list), checklist (list). "
                f"All text values in the JSON output MUST be in {language}."
            ),
            f"Task: {title}\nContext: {context or 'none'}",
            fallback,
        )

    async def panic_button(self, title: str, blocker: str, audience: str, requested_extension: str, language: str = "English") -> dict[str, Any]:
        fallback = {
            "extension_email": (
                f"Hi, I am blocked on '{title}' because {blocker}. "
                f"Could I please have {requested_extension}? I will share an updated timeline today."
            ),
            "reschedule_proposal": ["Move remaining work to the next available focus block", "Send status update now"],
            "risk_summary": f"'{title}' is at risk due to: {blocker}.",
        }
        return await self.json_prompt(
            (
                "You are a deadline recovery specialist. Generate assets to help the user recover from a blocked task. "
                "Output JSON with keys: extension_email (string), reschedule_proposal (list of strings), risk_summary (string). "
                f"All text values in the JSON output MUST be in {language}."
            ),
            f"Task: {title}\nBlocker: {blocker}\nAudience: {audience}\nRequested extension: {requested_extension}",
            fallback,
        )

    async def follow_up(self, dependency: str, person: str, deadline: str, tone: str, language: str = "English") -> dict[str, Any]:
        fallback = {
            "message": f"Hi {person}, checking in on {dependency}. I need it before {deadline} to keep the work on track.",
            "subject": f"Quick check-in: {dependency}",
        }
        return await self.json_prompt(
            (
                "Write a concise dependency follow-up message. "
                "Output JSON with keys: message (string), subject (string). "
                f"All text values in the JSON output MUST be in {language}."
            ),
            f"Dependency: {dependency}\nPerson: {person}\nDeadline: {deadline}\nTone: {tone}",
            fallback,
        )


    async def daily_schedule(self, description: str, wake_up: str, sleep: str, language: str = "English") -> dict[str, Any]:
        fallback = {
            "schedule": [
                {"time": "07:00", "activity": "Wake up & morning routine", "duration_minutes": 30, "category": "personal"},
                {"time": "07:30", "activity": "Exercise / Workout", "duration_minutes": 45, "category": "health"},
                {"time": "08:15", "activity": "Breakfast", "duration_minutes": 30, "category": "personal"},
                {"time": "09:00", "activity": "Deep work block", "duration_minutes": 120, "category": "work"},
                {"time": "11:00", "activity": "Short break & hydration", "duration_minutes": 15, "category": "health"},
                {"time": "11:15", "activity": "Meetings / Emails", "duration_minutes": 60, "category": "work"},
                {"time": "12:15", "activity": "Lunch break", "duration_minutes": 45, "category": "personal"},
                {"time": "13:00", "activity": "Second deep work block", "duration_minutes": 90, "category": "work"},
                {"time": "14:30", "activity": "Review & planning", "duration_minutes": 30, "category": "work"},
                {"time": "15:00", "activity": "Learning / Side projects", "duration_minutes": 60, "category": "learning"},
                {"time": "16:00", "activity": "Walk / Light exercise", "duration_minutes": 30, "category": "health"},
                {"time": "16:30", "activity": "Creative / personal tasks", "duration_minutes": 60, "category": "personal"},
                {"time": "17:30", "activity": "Dinner", "duration_minutes": 45, "category": "personal"},
                {"time": "18:15", "activity": "Relaxation / Hobbies", "duration_minutes": 60, "category": "personal"},
                {"time": "19:15", "activity": "Evening review & journaling", "duration_minutes": 30, "category": "learning"},
                {"time": "19:45", "activity": "Wind-down routine", "duration_minutes": 60, "category": "health"},
                {"time": "22:00", "activity": "Sleep", "duration_minutes": 480, "category": "health"},
            ],
            "summary": f"A balanced daily routine from {wake_up} to {sleep} focused on {description}.",
            "tips": ["Stay hydrated throughout the day", "Avoid screens 1 hour before sleep", "Take short breaks every 90 minutes"],
        }
        return await self.json_prompt(
            (
                "You are a world-class productivity and wellness coach. Create a detailed, realistic daily routine schedule. "
                f"The person wakes up at {wake_up} and sleeps at {sleep}. "
                "Output JSON with keys: "
                "schedule (array of objects, each with: time (HH:MM 24h), activity (string), duration_minutes (int), category (one of: work/health/personal/learning/social)), "
                "summary (string describing the day), "
                "tips (array of 3 practical strings). "
                f"All text values MUST be in {language}. "
                "Make the schedule realistic, healthy, and well-balanced with proper breaks."
            ),
            f"Design a full daily routine for: {description}. Wake up: {wake_up}, Sleep time: {sleep}.",
            fallback,
        )


ai_service = AIService()

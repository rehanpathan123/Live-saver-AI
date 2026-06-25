import json
from datetime import datetime
from typing import Any

from langchain_openai import ChatOpenAI

from app.core.config import settings


class AIService:
    def __init__(self) -> None:
        self.enabled = bool(settings.openai_api_key)
        self.llm = (
            ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.2)
            if self.enabled
            else None
        )

    async def json_prompt(self, system: str, user: str, fallback: dict[str, Any]) -> dict[str, Any]:
        if not self.llm:
            return fallback
        response = await self.llm.ainvoke(
            [
                ("system", f"{system}\nReturn only valid JSON."),
                ("user", user),
            ]
        )
        try:
            return json.loads(str(response.content))
        except json.JSONDecodeError:
            return fallback | {"raw_response": str(response.content)}

    async def parse_task(self, text: str, reference_time: datetime | None) -> dict[str, Any]:
        fallback = {
            "task": text[:80],
            "deadline": None,
            "dependency": None,
            "dependency_date": None,
            "priority": "Medium",
            "estimated_minutes": 60,
        }
        return await self.json_prompt(
            "Extract task planning fields from natural language.",
            f"Reference time: {reference_time}. Text: {text}",
            fallback,
        )

    async def warm_start(self, title: str, context: str | None) -> dict[str, Any]:
        fallback = {
            "outline": ["Goal", "Key milestones", "Risks", "Next action"],
            "first_draft": f"Starter draft for {title}. Define the outcome, constraints, timeline, and owner.",
            "resources": ["Calendar availability", "Related notes", "Stakeholder inputs"],
            "checklist": ["Clarify objective", "Collect inputs", "Draft", "Review", "Submit"],
        }
        return await self.json_prompt(
            "Create a warm-start package that helps a user immediately begin a task.",
            f"Task: {title}\nContext: {context or ''}",
            fallback,
        )

    async def panic_button(self, title: str, blocker: str, audience: str, requested_extension: str) -> dict[str, Any]:
        fallback = {
            "extension_email": (
                f"Hi, I am blocked on {title} because {blocker}. "
                f"Could I please have {requested_extension}? I will share an updated timeline today."
            ),
            "reschedule_proposal": ["Move remaining work to the next available focus block", "Send status update now"],
            "risk_summary": f"{title} is at risk due to {blocker}.",
        }
        return await self.json_prompt(
            "Generate deadline recovery assets: extension email, reschedule proposal, and risk summary.",
            f"Task: {title}\nBlocker: {blocker}\nAudience: {audience}\nExtension: {requested_extension}",
            fallback,
        )

    async def follow_up(self, dependency: str, person: str, deadline: str, tone: str) -> dict[str, Any]:
        fallback = {
            "message": f"Hi {person}, checking in on {dependency}. I need it before {deadline} to keep the work on track.",
            "subject": f"Quick check-in: {dependency}",
        }
        return await self.json_prompt(
            "Write a concise dependency follow-up message.",
            f"Dependency: {dependency}\nPerson: {person}\nDeadline: {deadline}\nTone: {tone}",
            fallback,
        )


ai_service = AIService()

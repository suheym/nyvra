from typing import Annotated
import os

from fastapi import Depends, HTTPException, Request
from clerk_backend_api import Clerk, AuthenticateRequestOptions
from clerk_backend_api.security.types import RequestState


clerk_client = Clerk(
    bearer_auth=os.getenv("CLERK_SECRET_KEY")
)


def require_auth(request: Request) -> str:
    """Verify the Clerk session and return the authenticated Clerk user id."""

    try:
        state: RequestState = clerk_client.authenticate_request(
            request,
            AuthenticateRequestOptions(
                authorized_parties=[
                    origin.strip()
                    for origin in os.getenv(
                        "CLERK_AUTHORIZED_PARTIES",
                        "http://localhost:3000"
                    ).split(",")
                    if origin.strip()
                ],
                accepts_token=["session_token"],
            ),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        ) from exc

    if not state.is_signed_in or not state.payload or not state.payload.get("sub"):
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return str(state.payload["sub"])


CurrentUser = Annotated[str, Depends(require_auth)]
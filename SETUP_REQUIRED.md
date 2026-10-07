# Before running the updated Nyvra build

This revision adds Clerk authentication. The environment used to prepare the source archive cannot access the npm/PyPI registries, so dependency lockfiles could not be regenerated here.

From `frontend/` run:

```bash
npm install
```

This will install `@clerk/react` and regenerate `package-lock.json`.

From `backend/` run:

```bash
python -m venv .venv
# activate the environment, then:
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Then create a Clerk application and set the variables documented in `frontend/.env.example` and `backend/.env.example`.

Do not copy the original `backend/.env` from the uploaded archive into source control. It is intentionally excluded from the updated source archive.

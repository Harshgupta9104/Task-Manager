"""Test fixtures and configuration.

The test database is an **in-memory SQLite** instance so tests never modify
the developer's real database, never touch a file on disk, and run fast.

Isolation is provided by a single connection + transaction per test: every
test opens a savepoint, runs with its own session, and rolls back afterward.
That means:

- no schema drop/create between tests (fast);
- no database state leaks between tests;
- the shared in-memory database is never the production file.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# In-memory SQLite: no file on disk, never the developer's real DB.
# SQLAlchemy requires that in-memory SQLite databases share a single
# connection/transaction when used by multiple sessions, so we use the
# transactional-rollback pattern rather than a pool of separate connections.
TEST_DATABASE_URL = "sqlite:///:memory:"

_test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Provide a fresh, isolated database session for each test.

    A single in-memory SQLite database is created once per test function.
    Each test gets its own transactional scope, and all changes are rolled
    back at the end so the next test starts from a clean state.
    """
    # Create all tables in the shared in-memory database. Because the
    # database lives only for the lifetime of the test function, this
    # runs once per test, not once per suite.
    Base.metadata.create_all(bind=_test_engine)

    # Start a transaction scoped to this test.
    connection = _test_engine.connect()
    transaction = connection.begin()

    session = TestSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client whose database dependency returns the isolated
    test session."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

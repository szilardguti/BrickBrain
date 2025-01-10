from enum import Enum


class ErrorCode(Enum):
    NO_COOKIE = 401
    SCRAPE_LIMIT_EXCEEDED = 501


class MyCustomError(Exception):
    def __init__(self, message, code: ErrorCode):
        super().__init__(message)
        self.code = code

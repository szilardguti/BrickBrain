from enum import Enum


class ErrorCode(Enum):
    SCRAPE_LIMIT_EXCEEDED = 501


class MyCustomError(Exception):
    def __init__(self, message, code: ErrorCode):
        super().__init__(message)
        self.code = code

from src.lib.message_utils import extract_text_content, to_langchain_messages
from src.models.chat import ChatMessage


def test_to_langchain_messages_preserves_roles() -> None:
    messages = [
        ChatMessage(role="system", content="System"),
        ChatMessage(role="user", content="Hello"),
        ChatMessage(role="assistant", content="Hi"),
    ]

    converted = to_langchain_messages(messages)

    assert len(converted) == 3
    assert converted[0].type == "system"
    assert converted[1].type == "human"
    assert converted[2].type == "ai"


def test_extract_text_content_from_mixed_blocks() -> None:
    content = [
        {"text": "Hello"},
        " ",
        {"type": "ignored", "value": "x"},
        {"text": "world"},
    ]

    assert extract_text_content(content) == "Hello world"

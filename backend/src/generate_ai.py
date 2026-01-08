# generate_ai.py
from langchain.chat_models import ChatOpenAI

def generate_readable_answer(user_query, relevant_chunks):
    """
    Sends user query + relevant chunks to Gemini-2.5 Flash for human-readable answer
    """
    model = ChatOpenAI(
        model_name="gemini-2.5-flash",  # Gemini Flash AI
        temperature=0,
        max_tokens=500
    )

    prompt = f"""
You are a security RAG assistant. User query: {user_query}
Here is relevant data extracted from the JSON scan:
{relevant_chunks}

Please provide a clear, structured, human-readable answer in bullet points or table format.
    """
    response = model(prompt)
    return response
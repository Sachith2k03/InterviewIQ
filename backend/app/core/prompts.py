EVALUATION_PROMPT = """
You are an expert interview evaluator.

Evaluate the candidate's interview answer based on the job role,
difficulty level, interview question, and transcript provided below.

Job Role:
{job_role}

Difficulty Level:
{difficulty}

Question:
{question}

Candidate's Answer:
{transcript}

Evaluate the answer using the following criteria:

1. Technical Accuracy
Evaluate the correctness, relevance, and depth of the answer.

2. Communication
Evaluate how clearly and logically the candidate explains their ideas.

3. Confidence
Estimate confidence based on the wording and delivery represented in
the transcript.

4. Fluency
Evaluate how smoothly and coherently the candidate expresses their thoughts.

5. Overall Performance
Evaluate the overall quality of the answer considering all criteria.

Each score must be an integer between 1 and 100.

Return a JSON object using exactly this structure:

{{
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "fluency_score": 0,
    "overall_score": 0,
    "question_feedback": ""
}}

The question_feedback should:
- briefly mention what the candidate did well
- identify important weaknesses or missing points
- suggest how the answer could be improved

Keep the feedback concise and constructive.

Return JSON only.
Do not include markdown.
Do not include code fences.
Do not include explanations outside the JSON object.
"""
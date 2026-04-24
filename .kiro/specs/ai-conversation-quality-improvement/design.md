# Design Document: AI Conversation Quality Improvement (Full Implementation)

## Executive Summary

This design implements a **cost-optimized, multi-model AI Agent architecture** for Lexi's conversational AI system. Instead of using a single model, we employ **intelligent model routing** to balance quality, latency, and cost:

- **Nova Micro** (cheapest, fastest) → A1-A2 learners with simple scaffolding
- **Nova Lite** (balanced) → B1-B2 learners with moderate complexity
- **Nova Pro** (highest quality) → C1-C2 learners requiring sophisticated responses

This approach reduces cost by ~60% while maintaining quality through optimized prompts, streaming, and prompt caching.

---

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│              Session UI + Audio Recording                    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────────┐
│              API Gateway + Lambda                            │
│         (session_handler.py)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│         SubmitSpeakingTurnUseCase                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Analyze user input (ComprehendAnalysisService)   │   │
│  │ 2. Route to appropriate model (ModelRouter)         │   │
│  │ 3. Generate response (ConversationGenerationService)│   │
│  │ 4. Synthesize audio (PollySpeechSynthesisService)   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼──────────┐
│  Bedrock Runtime │    │  DynamoDB         │
│  (Model Routing) │    │  (Session Store)  │
│                  │    │                   │
│ • Nova Micro     │    │ • Sessions        │
│ • Nova Lite      │    │ • Turns           │
│ • Nova Pro       │    │ • Scoring         │
└──────────────────┘    └───────────────────┘
```

### 1.2 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Multi-model routing** | Cost optimization: Micro (A1-A2) costs 70% less than Pro |
| **Prompt caching** | Reuse system prompt + session metadata across turns (5-min TTL) |
| **Streaming responses** | Reduce TTFT from ~1.5s to <400ms, improve UX |
| **Structured prompts** | 5-section format (Identity, Personality, Behaviors, Rules, Guardrails) |
| **Bilingual scaffolding** | Progressive hints for A1-A2 (Vietnamese + English) |
| **Delivery cues** | TTS prosody control via `[warmly]`, `[encouragingly]` markers |

---

## 2. Model Routing Strategy (Scenario B: Nova Micro for All + Fallback)

### 2.1 Model Selection Matrix

```python
MODEL_ROUTING = {
    "A1": {
        "primary_model": "amazon.nova-micro-v1:0",
        "max_tokens": 40,
        "temperature": 0.6,
        "fallback_model": None,  # No fallback needed
        "fallback_rate": 0,
        "reason": "Beginner: Micro sufficient for simple responses"
    },
    "A2": {
        "primary_model": "amazon.nova-micro-v1:0",
        "max_tokens": 60,
        "temperature": 0.65,
        "fallback_model": None,
        "fallback_rate": 0,
        "reason": "Beginner: Micro sufficient for simple responses"
    },
    "B1": {
        "primary_model": "amazon.nova-micro-v1:0",
        "max_tokens": 100,
        "temperature": 0.7,
        "fallback_model": "amazon.nova-lite-v1:0",
        "fallback_rate": 0.05,  # 5% fallback to Lite
        "reason": "Intermediate: Micro primary, Lite fallback for quality"
    },
    "B2": {
        "primary_model": "amazon.nova-micro-v1:0",
        "max_tokens": 150,
        "temperature": 0.75,
        "fallback_model": "amazon.nova-lite-v1:0",
        "fallback_rate": 0.10,  # 10% fallback to Lite
        "reason": "Intermediate: Micro primary, Lite fallback for quality"
    },
    "C1": {
        "primary_model": "amazon.nova-micro-v1:0",
        "max_tokens": 200,
        "temperature": 0.8,
        "fallback_model": "amazon.nova-pro-v1:0",
        "fallback_rate": 0.30,  # 30% fallback to Pro
        "reason": "Advanced: Micro primary, Pro fallback for sophistication"
    },
    "C2": {
        "primary_model": "amazon.nova-micro-v1:0",
        "max_tokens": 250,
        "temperature": 0.85,
        "fallback_model": "amazon.nova-pro-v1:0",
        "fallback_rate": 0.40,  # 40% fallback to Pro
        "reason": "Advanced: Micro primary, Pro fallback for sophistication"
    }
}
```

### 2.2 Cost Comparison

| Level | Primary | Fallback | Fallback Rate | Actual Cost |
|-------|---------|----------|---------------|-------------|
| A1-A2 | Micro | None | 0% | $0.008 |
| B1 | Micro | Lite | 5% | $0.0088 |
| B2 | Micro | Lite | 10% | $0.0096 |
| C1 | Micro | Pro | 30% | $0.0136 |
| C2 | Micro | Pro | 40% | $0.0173 |
| **Blended (40% A1-A2, 20% B1, 20% B2, 10% C1, 10% C2)** | - | - | - | **~$0.0099** |
| Claude 3 Haiku (current) | - | - | - | ~$0.032 |

**Savings: ~69% cost reduction vs. Claude Haiku, ~75% vs. single Nova Pro**

---

## 3. Prompt Engineering Strategy

### 3.1 Structured Prompt Template (5 Sections)

```
SECTION 1: IDENTITY
- Role name, relationship to learner, primary purpose
- Example: "You are Alex, a friendly English conversation partner"

SECTION 2: PERSONALITY
- 3-5 character traits, emotional tone
- Adapt per level: encouraging (A1-A2), supportive (B1-B2), engaging (C1-C2)
- Example: "You are warm, patient, and genuinely interested in helping"

SECTION 3: BEHAVIORS
- Conversational patterns, interaction style
- Example: "Ask one question per turn. Use simple vocabulary for beginners"

SECTION 4: RESPONSE RULES
- Format constraints, length limits, delivery cues
- Example: "No markdown. Include [warmly] or [encouragingly] at start"

SECTION 5: GUARDRAILS
- Off-topic redirect, Vietnamese detection, scope boundaries
- Example: "If learner writes Vietnamese, gently request English"
```

### 3.2 Prompt Template (Pseudo-code)

```python
def build_optimized_prompt(session: Session) -> str:
    level = session.level  # A1, A2, B1, B2, C1, C2
    
    # SECTION 1: IDENTITY
    identity = f"""
You are {session.ai_role_id}, a friendly English conversation partner.
Your role: Help {session.learner_role_id} practice English in a {session.scenario_title} scenario.
Your purpose: Make learning enjoyable and build confidence.
"""
    
    # SECTION 2: PERSONALITY (Level-Adaptive)
    personality_traits = {
        "A1": "warm, patient, encouraging, simple, clear",
        "A2": "supportive, friendly, helpful, reassuring",
        "B1": "engaging, curious, natural, conversational",
        "B2": "thoughtful, nuanced, encouraging deeper thinking",
        "C1": "sophisticated, intellectually engaging, challenging",
        "C2": "native-like, natural, intellectually stimulating"
    }
    
    personality = f"""
Personality: You are {personality_traits[level]}.
Emotional tone: {EMOTIONAL_TONE[level]}
"""
    
    # SECTION 3: BEHAVIORS
    behaviors = f"""
Conversational patterns:
- Ask ONE question per turn (not multiple)
- Use {VOCABULARY_LEVEL[level]} vocabulary
- Keep responses SHORT and NATURAL
- Always move conversation forward
- Show genuine interest in learner's ideas
"""
    
    # SECTION 4: RESPONSE RULES
    response_rules = f"""
Format constraints:
- NO markdown, NO lists, NO em-dashes
- Spoken-first format (sounds natural when read aloud)
- Include delivery cue at start: [warmly], [encouragingly], [gently], etc.
- Max {MAX_TOKENS[level]} tokens
- One question per turn

Examples of good responses:
{EXAMPLES[level]}
"""
    
    # SECTION 5: GUARDRAILS
    guardrails = f"""
Off-topic handling:
- If learner goes off-topic: "That's interesting! But let's focus on {session.scenario_title}..."
- If learner uses Vietnamese: "Please try in English! I'll help you. [simple prompt]"
- If inappropriate language: "Let's keep it professional. Now, {session.selected_goals[0]}..."

Scope boundaries:
- Do NOT correct grammar during conversation (feedback happens after)
- Do NOT fabricate scenario context
- Do NOT reveal you are an AI unless directly asked
- Do NOT provide opinions on non-learning topics
"""
    
    return identity + personality + behaviors + response_rules + guardrails
```

### 3.3 Few-Shot Examples (Per Level - Enhanced for Micro)

```python
# Enhanced examples to compensate for Micro's limitations
EXAMPLES = {
    "A1": """
Learner: "I like pizza"
Good response: "[warmly] That's great! Do you like pizza with cheese?"
Bad response: "Pizza is a delicious Italian dish made with dough, sauce, and toppings..."

Learner: "What is your name?"
Good response: "[warmly] I'm Alex! What's your name?"
Bad response: "My name is Alex. I am a conversational AI assistant..."
""",
    
    "A2": """
Learner: "I like cooking"
Good response: "[warmly] That's wonderful! What's your favorite dish to cook?"
Bad response: "Cooking is the process of preparing food..."

Learner: "I went to the park"
Good response: "[warmly] That sounds nice! What did you do there?"
Bad response: "Parks are outdoor areas with grass and trees..."
""",
    
    "B1": """
Learner: "I went to the beach yesterday"
Good response: "[encouragingly] That sounds fun! What did you do there? Did you swim or relax?"
Bad response: "Beaches are coastal areas where land meets water..."

Learner: "I like learning English"
Good response: "[encouragingly] That's great! How long have you been learning? What's your favorite part?"
Bad response: "English is a language spoken in many countries..."

Learner: "I'm interested in cooking"
Good response: "[encouragingly] That's wonderful! What type of food do you like to cook? Do you cook alone or with friends?"
Bad response: "Cooking is an important skill..."
""",
    
    "B2": """
Learner: "I think remote work is better than office work"
Good response: "[thoughtfully] That's an interesting perspective. What advantages do you see? Are there any disadvantages?"
Bad response: "Remote work is a modern work arrangement..."

Learner: "I went to a concert last weekend"
Good response: "[encouragingly] That sounds exciting! What kind of music was it? How did you feel about the performance?"
Bad response: "Concerts are musical performances..."

Learner: "I'm thinking about changing careers"
Good response: "[thoughtfully] That's a big decision. What's motivating this change? What field are you considering?"
Bad response: "Career changes are common in modern society..."
""",
    
    "C1": """
Learner: "I think technology is changing society too fast"
Good response: "[thoughtfully] That's an interesting perspective. What specific changes concern you most? Are you worried about job displacement, privacy, or social impacts?"
Bad response: "Technology has been advancing rapidly since the industrial revolution..."

Learner: "I believe education should focus more on practical skills"
Good response: "[thoughtfully] That's a compelling argument. How would you balance practical skills with theoretical knowledge? What's your view on critical thinking?"
Bad response: "Education is important for society..."

Learner: "I'm concerned about climate change"
Good response: "[thoughtfully] That's an important concern. What aspects worry you most? Do you think individual actions or policy changes are more effective?"
Bad response: "Climate change is a global issue..."
""",
    
    "C2": """
Learner: "I think artificial intelligence will fundamentally reshape society"
Good response: "[thoughtfully] That's a nuanced observation. In what ways do you envision this reshaping? Are you more optimistic or cautious about the implications?"
Bad response: "Artificial intelligence is a technology..."

Learner: "I believe the education system needs radical transformation"
Good response: "[thoughtfully] That's a compelling perspective. What specific aspects would you prioritize? How would you address the transition challenges?"
Bad response: "Education systems vary across countries..."

Learner: "I'm exploring philosophical questions about consciousness"
Good response: "[thoughtfully] That's a fascinating area. What's your current thinking on the relationship between consciousness and physical processes? How does this relate to your own experience?"
Bad response: "Consciousness is studied in philosophy and neuroscience..."
"""
}
```

### 3.4 Quality Validation for Micro Responses

```python
def validate_micro_response(response, level):
    """
    Validate Micro response meets quality standards for level.
    If validation fails, trigger fallback to Lite/Pro.
    """
    
    validation_rules = {
        "A1": {
            "min_sentences": 1,
            "max_sentences": 2,
            "has_question": True,
            "no_markdown": True,
        },
        "A2": {
            "min_sentences": 1,
            "max_sentences": 2,
            "has_question": True,
            "no_markdown": True,
        },
        "B1": {
            "min_sentences": 2,
            "max_sentences": 4,
            "has_question": True,
            "has_follow_up": True,  # Follow-up question
            "vocabulary_diversity": 0.7,  # 70% unique words
            "no_markdown": True,
        },
        "B2": {
            "min_sentences": 2,
            "max_sentences": 4,
            "has_question": True,
            "has_follow_up": True,
            "vocabulary_diversity": 0.8,  # 80% unique words
            "no_markdown": True,
        },
        "C1": {
            "min_sentences": 3,
            "max_sentences": 5,
            "has_question": True,
            "has_follow_up": True,
            "vocabulary_diversity": 0.85,
            "has_engagement": True,  # Shows genuine interest
            "no_markdown": True,
        },
        "C2": {
            "min_sentences": 3,
            "max_sentences": 5,
            "has_question": True,
            "has_follow_up": True,
            "vocabulary_diversity": 0.9,
            "has_engagement": True,
            "has_nuance": True,  # Nuanced reasoning
            "no_markdown": True,
        }
    }
    
    rules = validation_rules[level]
    
    # Check each rule
    for rule, threshold in rules.items():
        if not check_rule(response, rule, threshold):
            logger.warning(f"Validation failed for {level}: {rule}")
            return False
    
    return True
```

---

## 4. Streaming & Latency Optimization

### 4.1 Streaming Implementation

```python
def generate_reply_streaming(session, user_turn, analysis, turn_history):
    """
    Use InvokeModelWithResponseStream for progressive token delivery.
    Target: TTFT < 400ms (95th percentile)
    """
    
    # 1. Build prompt with caching
    system_prompt = build_optimized_prompt(session)
    messages = build_messages_for_llm(turn_history + [user_turn])
    
    # 2. Prepare request with streaming
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": MAX_TOKENS[session.level],
        "system": system_prompt,
        "messages": messages,
        "temperature": TEMPERATURE[session.level],
        "top_p": 0.9,
    }
    
    # 3. Invoke with streaming
    response = bedrock_client.invoke_model_with_response_stream(
        modelId=MODEL_ROUTING[session.level]["model"],
        body=json.dumps(body),
    )
    
    # 4. Stream tokens to TTS incrementally
    full_response = ""
    for event in response["body"]:
        chunk = json.loads(event["chunk"]["bytes"])
        if "contentBlockDelta" in chunk:
            token = chunk["contentBlockDelta"]["delta"]["text"]
            full_response += token
            
            # Send to TTS incrementally (for real-time audio)
            yield token
    
    return full_response
```

### 4.2 Prompt Caching Strategy

```python
def build_cached_prompt(session):
    """
    Use Bedrock prompt caching to reuse system prompt + metadata.
    Cache TTL: 5 minutes
    Cache size: ~1-2K tokens per session
    """
    
    # Static part (cached)
    system_prompt = build_optimized_prompt(session)
    
    # Dynamic part (not cached)
    messages = build_messages_for_llm(turn_history + [user_turn])
    
    # Request with cache control
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "system": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"}  # 5-min TTL
            }
        ],
        "messages": messages,
        "max_tokens": MAX_TOKENS[session.level],
    }
    
    return body
```

---

## 5. Bilingual Scaffolding System

### 5.1 Progressive Hint Levels

```python
class ScaffoldingSystem:
    """
    Progressive hints for A1-A2 learners when stuck (silence > 10s).
    """
    
    HINT_LEVELS = {
        10: "gentle_prompt",      # 10s silence
        20: "vocabulary_hint",    # 20s silence
        30: "sentence_starter"    # 30s silence
    }
    
    def get_hint(self, session, turn_context, silence_duration):
        if session.level not in ["A1", "A2"]:
            return None  # B1+ don't get hints
        
        hint_type = self.HINT_LEVELS.get(silence_duration)
        if not hint_type:
            return None
        
        if hint_type == "gentle_prompt":
            # English only
            return f"[gently] Can you tell me about {turn_context['topic']}?"
        
        elif hint_type == "vocabulary_hint":
            # Bilingual: Vietnamese + English
            words = self._extract_key_words(turn_context)
            return f"[gently] Từ khóa: {words['vi']} (Keywords: {words['en']})"
        
        elif hint_type == "sentence_starter":
            # Bilingual: Vietnamese + English
            starter = self._generate_sentence_starter(turn_context)
            return f"[gently] Bắt đầu: {starter['vi']} (Start: {starter['en']})"
    
    def _extract_key_words(self, context):
        # Extract 2-3 relevant words
        return {
            "vi": "tôi, thích, ...",
            "en": "I, like, ..."
        }
    
    def _generate_sentence_starter(self, context):
        # Generate first 3-5 words
        return {
            "vi": "Tôi thích...",
            "en": "I like..."
        }
```

---

## 6. Response Quality Metrics

### 6.1 Metrics to Log

```python
def log_response_metrics(session, turn, response, latency):
    """
    Log metrics for monitoring and optimization.
    """
    metrics = {
        "session_id": session.session_id,
        "turn_index": turn.turn_index,
        "model_used": MODEL_ROUTING[session.level]["model"],
        "proficiency_level": session.level,
        
        # Latency metrics
        "ttft_ms": latency["ttft"],  # Time to first token
        "total_latency_ms": latency["total"],
        "streaming_enabled": True,
        
        # Response metrics
        "response_tokens": len(response.split()),
        "response_length_compliance": response_tokens <= MAX_TOKENS[session.level],
        "has_delivery_cue": "[" in response and "]" in response,
        "has_markdown": any(c in response for c in ["*", "#", "-", "["]),
        "question_count": response.count("?"),
        
        # Cost metrics
        "estimated_cost": calculate_cost(session.level, response),
        
        # Quality metrics
        "timestamp": datetime.now().isoformat(),
    }
    
    # Log to CloudWatch
    cloudwatch.put_metric_data(
        Namespace="Lexi/ConversationQuality",
        MetricData=[
            {"MetricName": "TTFT", "Value": metrics["ttft_ms"]},
            {"MetricName": "ResponseTokens", "Value": metrics["response_tokens"]},
            {"MetricName": "EstimatedCost", "Value": metrics["estimated_cost"]},
        ]
    )
    
    return metrics
```

---

## 7. Implementation Phases

### Phase 1: Prompt Optimization (Week 1)
- [ ] Implement 5-section prompt structure
- [ ] Add level-adaptive personality traits
- [ ] Add delivery cues for TTS
- [ ] Add few-shot examples per level
- [ ] Test with all proficiency levels

### Phase 2: Model Routing & Streaming (Week 2)
- [ ] Implement ModelRouter (Micro/Lite/Pro selection)
- [ ] Implement streaming with InvokeModelWithResponseStream
- [ ] Implement prompt caching
- [ ] Implement latency monitoring
- [ ] Test TTFT < 400ms target

### Phase 3: Scaffolding & Guardrails (Week 3)
- [ ] Implement bilingual scaffolding system
- [ ] Implement Vietnamese detection
- [ ] Implement off-topic redirect logic
- [ ] Implement guardrails via Bedrock Guardrails API
- [ ] Test with A1-A2 learners

### Phase 4: Metrics & Monitoring (Week 4)
- [ ] Implement metrics logging
- [ ] Set up CloudWatch dashboards
- [ ] Implement cost tracking per session
- [ ] Implement quality scoring
- [ ] A/B test vs. current system

---

## 8. Data Structures

### 8.1 Session Metadata (Enhanced)

```python
@dataclass
class Session:
    session_id: str
    user_id: str
    scenario_id: str
    learner_role_id: str
    ai_role_id: str
    ai_gender: Gender
    level: ProficiencyLevel  # A1-C2
    selected_goals: List[str]
    
    # NEW: Model routing
    assigned_model: str  # "amazon.nova-micro-v1:0", etc.
    
    # NEW: Metrics
    total_turns: int
    user_turns: int
    hint_used_count: int
    avg_ttft_ms: float
    avg_response_tokens: int
    estimated_total_cost: float
    
    # NEW: Caching
    prompt_cache_id: str  # For prompt caching
    cache_created_at: datetime
    
    status: str  # ACTIVE, COMPLETED
    created_at: str
    updated_at: str
```

### 8.2 Turn Metadata (Enhanced)

```python
@dataclass
class Turn:
    session_id: str
    turn_index: int
    speaker: Speaker  # USER, AI
    content: str
    audio_url: str
    translated_content: str
    is_hint_used: bool
    
    # NEW: Metrics
    model_used: str
    ttft_ms: float
    total_latency_ms: float
    response_tokens: int
    delivery_cue: str  # "[warmly]", "[encouragingly]", etc.
    
    # NEW: Quality
    has_markdown: bool
    question_count: int
    estimated_cost: float
    
    created_at: str
```

---

## 5.5 Fallback Strategy (Quality Validation)

### 5.5.1 Fallback Logic

When Micro response fails quality validation, automatically fallback to Lite/Pro:

```python
def generate_reply_with_quality_fallback(session, user_turn, analysis, turn_history):
    """
    Scenario B: Try Micro first, fallback to Lite/Pro if quality validation fails.
    """
    
    level = session.level
    routing = MODEL_ROUTING[level]
    
    # 1. Try primary model (Micro)
    try:
        response = invoke_model(
            model=routing["primary_model"],
            max_tokens=routing["max_tokens"],
            temperature=routing["temperature"],
            timeout=5000,
        )
        
        # 2. Validate response quality
        if validate_micro_response(response, level):
            log_metrics(session, "primary", response)
            return response
        
        # 3. Validation failed, trigger fallback
        logger.warning(f"Micro response failed validation for {level}, using fallback")
        
    except TimeoutError:
        logger.warning(f"Micro model timed out for {level}, using fallback")
    
    except Exception as e:
        logger.error(f"Micro model error: {e}, using fallback")
    
    # 4. Fallback to Lite/Pro
    if routing["fallback_model"]:
        try:
            response = invoke_model(
                model=routing["fallback_model"],
                max_tokens=routing["max_tokens"],
                temperature=routing["temperature"],
                timeout=5000,
            )
            log_metrics(session, "fallback", response)
            return response
        
        except Exception as e:
            logger.error(f"Fallback model error: {e}")
            return "Thanks. Could you say a bit more about that?"
    
    # 5. No fallback available, return default
    return "Thanks. Could you say a bit more about that?"
```

### 5.5.2 Fallback Rate Monitoring

```python
def monitor_fallback_rates():
    """
    Track fallback usage to detect quality issues.
    """
    
    fallback_metrics = {
        "A1": {"target": 0, "actual": 0},
        "A2": {"target": 0, "actual": 0},
        "B1": {"target": 5, "actual": 0},  # 5% fallback rate
        "B2": {"target": 10, "actual": 0},  # 10% fallback rate
        "C1": {"target": 30, "actual": 0},  # 30% fallback rate
        "C2": {"target": 40, "actual": 0},  # 40% fallback rate
    }
    
    # Query CloudWatch for actual fallback rates
    for level in fallback_metrics:
        actual_rate = query_cloudwatch(
            metric="FallbackRate",
            dimensions={"Level": level},
            period=3600,  # 1 hour
        )
        fallback_metrics[level]["actual"] = actual_rate
        
        # Alert if actual > target + 10%
        if actual_rate > fallback_metrics[level]["target"] + 10:
            alert(f"High fallback rate for {level}: {actual_rate}%")
    
    return fallback_metrics
```

### 5.5.3 Fallback Metrics Logging

```python
def log_metrics(session, model_source, response):
    """
    Log whether response came from primary or fallback model.
    """
    
    metrics = {
        "session_id": session.session_id,
        "level": session.level,
        "model_source": model_source,  # "primary" or "fallback"
        "model_used": MODEL_ROUTING[session.level]["primary_model"] if model_source == "primary" else MODEL_ROUTING[session.level]["fallback_model"],
        "response_tokens": len(response.split()),
        "timestamp": datetime.now().isoformat(),
    }
    
    # Log to CloudWatch
    cloudwatch.put_metric_data(
        Namespace="Lexi/ConversationQuality",
        MetricData=[
            {
                "MetricName": "ModelSource",
                "Value": 1 if model_source == "primary" else 0,
                "Dimensions": [
                    {"Name": "Level", "Value": session.level},
                    {"Name": "ModelSource", "Value": model_source},
                ]
            }
        ]
    )
    
    # Log to DynamoDB for analysis
    dynamodb.put_item(
        TableName="ConversationMetrics",
        Item=metrics
    )
```

---

## 9. Error Handling & Fallbacks

### 9.1 Model Fallback Strategy

```python
def generate_reply_with_fallback(session, user_turn, analysis, turn_history):
    """
    Try primary model, fallback to Lite/Pro if quality validation fails.
    """
    
    level = session.level
    routing = MODEL_ROUTING[level]
    
    try:
        # Try primary model (Micro) with 5s timeout
        response = invoke_model_with_timeout(
            model=routing["primary_model"],
            timeout=5000,  # 5 seconds
            ...
        )
        
        # Validate response quality
        if validate_micro_response(response, level):
            return response
        
        # Validation failed, use fallback
        if routing["fallback_model"]:
            response = invoke_model_with_timeout(
                model=routing["fallback_model"],
                timeout=5000,
                ...
            )
            return response
    
    except TimeoutError:
        logger.warning(f"Primary model {routing['primary_model']} timed out, using fallback")
        
        # Fallback to Lite/Pro
        if routing["fallback_model"]:
            response = invoke_model_with_timeout(
                model=routing["fallback_model"],
                timeout=5000,
                ...
            )
            return response
    
    except Exception as e:
        logger.error(f"Model invocation failed: {e}")
        return "Thanks. Could you say a bit more about that?"
```

---

## 10. Success Criteria

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **TTFT (95th percentile)** | < 400ms | ~1500ms | ✗ |
| **Response Length Compliance** | > 95% | ~60% | ✗ |
| **Format Compliance (no markdown)** | > 99% | ~70% | ✗ |
| **Cost per Session** | < $0.015 | ~$0.032 | ✗ |
| **Beginner Retention (A1-A2)** | > 70% | ~40% | ✗ |
| **User Satisfaction** | > 4.2/5.0 | ~3.5/5.0 | ✗ |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Micro model too weak for A2** | Quality degradation | A/B test, fallback to Lite if needed |
| **Streaming latency issues** | Poor UX | Implement request batching, use latency-optimized tier |
| **Prompt caching misses** | Wasted cache space | Monitor cache hit rate, adjust TTL |
| **Vietnamese detection false positives** | Unnecessary hints | Use AWS Comprehend language detection |
| **Cost overruns** | Budget exceeded | Implement per-user cost limits, alerts |

---

## 12. Deployment Strategy

### 12.1 Canary Rollout

1. **Week 1-2**: Deploy to 10% of A1-A2 learners (Micro model)
2. **Week 2-3**: Deploy to 50% of A1-A2 learners, 10% of B1-B2 (Lite model)
3. **Week 3-4**: Deploy to 100% of learners, monitor metrics
4. **Week 4+**: Optimize based on feedback

### 12.2 Rollback Plan

- If TTFT > 600ms: Disable streaming, use sync mode
- If cost > $0.02/session: Downgrade Lite to Micro for B1
- If satisfaction < 3.5/5.0: Revert to Claude Haiku

---

## 13. Configuration

### 13.1 Environment Variables

```bash
# Model IDs
BEDROCK_NOVA_MICRO_MODEL_ID=amazon.nova-micro-v1:0
BEDROCK_NOVA_LITE_MODEL_ID=amazon.nova-lite-v1:0
BEDROCK_NOVA_PRO_MODEL_ID=amazon.nova-pro-v1:0

# Streaming
ENABLE_STREAMING=true
STREAMING_TIMEOUT_MS=5000

# Prompt Caching
ENABLE_PROMPT_CACHING=true
CACHE_TTL_SECONDS=300

# Metrics
CLOUDWATCH_NAMESPACE=Lexi/ConversationQuality
LOG_METRICS=true

# Guardrails
BEDROCK_GUARDRAIL_ID=<guardrail-id>
ENABLE_GUARDRAILS=true
```

---

## 14. Testing Strategy

### 14.1 Unit Tests

- [ ] Test model routing logic (correct model per level)
- [ ] Test prompt building (all 5 sections present)
- [ ] Test scaffolding hints (correct level, bilingual format)
- [ ] Test response validation (no markdown, delivery cues, token limits)

### 14.2 Integration Tests

- [ ] Test end-to-end flow (user input → model → response → TTS)
- [ ] Test streaming (tokens arrive incrementally)
- [ ] Test prompt caching (cache hits reduce latency)
- [ ] Test fallback (timeout → fallback model)

### 14.3 Performance Tests

- [ ] Measure TTFT for each model
- [ ] Measure total latency for different response lengths
- [ ] Measure cost per session by level
- [ ] Measure cache hit rate

### 14.4 User Acceptance Tests

- [ ] A1-A2 learners: scaffolding helpful?
- [ ] B1-B2 learners: responses natural?
- [ ] C1-C2 learners: responses sophisticated?
- [ ] All levels: satisfaction > 4.0/5.0?


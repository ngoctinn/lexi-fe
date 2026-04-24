# Implementation Tasks: AI Conversation Quality Improvement

## Phase 1: Prompt Optimization (Week 1)

### 1.1 Implement 5-Section Prompt Structure
- [x] 1.1.1 Create `PromptBuilder` class with 5 sections (Identity, Personality, Behaviors, Rules, Guardrails)
- [x] 1.1.2 Implement level-adaptive personality traits (A1-C2)
- [x] 1.1.3 Add delivery cues support (`[warmly]`, `[encouragingly]`, etc.)
- [x] 1.1.4 Add few-shot examples per level
- [x] 1.1.5 Test prompt generation for all levels

### 1.2 Update Prompt Builder Service
- [x] 1.2.1 Refactor `prompt_builder.py` to use new 5-section structure
- [x] 1.2.2 Add `build_optimized_prompt()` function
- [x] 1.2.3 Add level-specific vocabulary instructions
- [x] 1.2.4 Add response format constraints (no markdown, one question per turn)
- [x] 1.2.5 Add guardrail instructions (off-topic, Vietnamese, inappropriate language)

### 1.3 Add Few-Shot Examples
- [x] 1.3.1 Create example responses for each level (A1-C2)
- [x] 1.3.2 Embed examples in system prompt
- [x] 1.3.3 Test that examples improve response quality

### 1.4 Test Prompt Quality
- [x] 1.4.1 Unit test: prompt contains all 5 sections
- [x] 1.4.2 Unit test: personality traits match level
- [x] 1.4.3 Unit test: delivery cues present
- [x] 1.4.4 Integration test: Claude generates responses matching examples
- [x] 1.4.5 Manual review: responses sound natural for each level

---

## Phase 2: Model Routing & Streaming (Week 2)

### 2.1 Implement Model Router (Scenario B: Micro Primary + Fallback)
- [x] 2.1.1 Create `ModelRouter` class with routing logic
- [x] 2.1.2 Implement routing matrix (A1→Micro, A2→Micro, B1→Micro+Lite, B2→Micro+Lite, C1→Micro+Pro, C2→Micro+Pro)
- [x] 2.1.3 Add max_tokens per level (40, 60, 100, 150, 200, 250)
- [x] 2.1.4 Add temperature per level (0.6-0.85)
- [x] 2.1.5 Add fallback_model and fallback_rate per level
- [x] 2.1.6 Unit test: correct model selected per level
- [x] 2.1.7 Unit test: fallback rates correct per level

### 2.2 Implement Streaming
- [x] 2.2.1 Replace `invoke_model()` with `invoke_model_with_response_stream()`
- [x] 2.2.2 Implement token streaming to TTS incrementally
- [x] 2.2.3 Add timeout handling (5 seconds max)
- [x] 2.2.4 Add fallback to sync mode if streaming fails
- [x] 2.2.5 Test TTFT < 400ms for 95th percentile

### 2.3 Implement Quality Validation for Micro Responses
- [x] 2.3.1 Create `ResponseValidator` class with validation rules per level
- [x] 2.3.2 Implement validation rules (min/max sentences, has question, vocabulary diversity)
- [x] 2.3.3 Implement fallback trigger logic (if validation fails, use fallback model)
- [x] 2.3.4 Log validation results (pass/fail, reason)
- [x] 2.3.5 Unit test: validation rules correct per level
- [x] 2.3.6 Integration test: fallback triggered on validation failure

### 2.4 Implement Prompt Caching
- [x] 2.4.1 Add cache_control to system prompt
- [x] 2.4.2 Set cache TTL to 5 minutes
- [x] 2.4.3 Track cache hit rate
- [x] 2.4.4 Monitor cache effectiveness (latency reduction)
- [x] 2.4.5 Test: cache hits reduce latency by 20-30%

### 2.5 Implement Latency & Fallback Monitoring
- [x] 2.5.1 Log TTFT for every response
- [x] 2.5.2 Log total latency for every response
- [x] 2.5.3 Log response token count
- [x] 2.5.4 Log model_source (primary or fallback) for every response
- [x] 2.5.5 Log fallback_reason (validation failed, timeout, error)
- [x] 2.5.6 Send metrics to CloudWatch
- [ ] 2.5.7 Create CloudWatch dashboard for latency tracking
- [ ] 2.5.8 Create CloudWatch dashboard for fallback rate tracking

### 2.6 Test Streaming, Caching & Fallback
- [x] 2.6.1 Performance test: TTFT < 400ms (95th percentile)
- [x] 2.6.2 Performance test: total latency < 2 seconds (95th percentile)
- [x] 2.6.3 Performance test: streaming success rate > 98%
- [x] 2.6.4 Load test: 100 concurrent sessions
- [x] 2.6.5 Fallback test: timeout → fallback model works
- [x] 2.6.6 Fallback test: validation failure → fallback model works
- [x] 2.6.7 Fallback rate test: actual rates match targets (±10%)

---

## Phase 3: Scaffolding & Guardrails (Week 3)

### 3.1 Implement Bilingual Scaffolding System
- [x] 3.1.1 Create `ScaffoldingSystem` class
- [x] 3.1.2 Implement 3 hint levels (gentle_prompt, vocabulary_hint, sentence_starter)
- [x] 3.1.3 Implement silence detection (10s, 20s, 30s)
- [x] 3.1.4 Generate bilingual hints (Vietnamese + English)
- [x] 3.1.5 Format hints correctly (Vietnamese first, then English)

### 3.2 Implement Vietnamese Detection
- [x] 3.2.1 Use AWS Comprehend `detect_dominant_language()`
- [x] 3.2.2 Detect when learner writes in Vietnamese
- [x] 3.2.3 Trigger gentle redirect: "Please try in English! I'll help you."
- [x] 3.2.4 Provide simple English prompt after redirect
- [x] 3.2.5 Test: Vietnamese detection accuracy > 95%

### 3.3 Implement Off-Topic Redirect
- [x] 3.3.1 Detect off-topic messages (via prompt instruction)
- [x] 3.3.2 Implement gentle redirect within 1 turn
- [x] 3.3.3 Redirect format: "That's interesting! But let's focus on [scenario]..."
- [x] 3.3.4 Test: off-topic redirect effectiveness

### 3.4 Implement Bedrock Guardrails
- [x] 3.4.1 Create Bedrock Guardrail for content filtering
- [x] 3.4.2 Configure content filters (hate, insults, sexual, violence)
- [x] 3.4.3 Configure denied topics (non-learning topics)
- [x] 3.4.4 Apply guardrails to model invocation
- [x] 3.4.5 Test: guardrails block inappropriate content

### 3.5 Test Scaffolding & Guardrails
- [x] 3.5.1 Unit test: hint generation for each level
- [x] 3.5.2 Unit test: bilingual format correct
- [x] 3.5.3 Integration test: A1-A2 learners receive hints
- [x] 3.5.4 Integration test: B1+ learners don't receive hints
- [x] 3.5.5 User test: A1-A2 learners find hints helpful

---

## Phase 4: Metrics & Monitoring (Week 4)

### 4.1 Implement Metrics Logging
- [x] 4.1.1 Log TTFT, total latency, response tokens for every turn
- [x] 4.1.2 Log model used, proficiency level, cost per turn
- [x] 4.1.3 Log model_source (primary or fallback) for every turn
- [x] 4.1.4 Log fallback_reason (validation failed, timeout, error)
- [x] 4.1.5 Log response quality metrics (markdown, delivery cues, question count)
- [x] 4.1.6 Log hint usage, scaffolding effectiveness
- [x] 4.1.7 Store metrics in DynamoDB for analysis

### 4.2 Implement Cost Tracking
- [x] 4.2.1 Calculate cost per turn (input + output tokens)
- [x] 4.2.2 Calculate cost per session
- [x] 4.2.3 Calculate blended cost across all levels
- [x] 4.2.4 Track cost savings vs. Claude Haiku
- [x] 4.2.5 Set up cost alerts (> $0.02/session)

### 4.4 Implement Quality Scoring
- [x] 4.4.1 Score response length compliance (within token limits)
- [x] 4.4.2 Score format compliance (no markdown, one question)
- [x] 4.4.3 Score delivery cue presence
- [x] 4.4.4 Calculate overall quality score per session
- [x] 4.4.5 Track quality trends over time

### 4.5 Set Up CloudWatch Dashboards
- [x] 4.5.1 Create dashboard for latency metrics (TTFT, total latency)
- [x] 4.5.2 Create dashboard for cost metrics (per session, per level)
- [x] 4.5.3 Create dashboard for quality metrics (compliance, scores)
- [x] 4.5.4 Create dashboard for usage metrics (sessions, turns, models)
- [x] 4.5.5 Create dashboard for fallback rates (per level)
- [x] 4.5.6 Set up alarms for SLA violations

### 4.6 Implement A/B Testing
- [x] 4.6.1 Create feature flag for new system vs. old system
- [x] 4.6.2 Route 10% of traffic to new system (Week 1)
- [x] 4.6.3 Route 50% of traffic to new system (Week 2)
- [x] 4.6.4 Route 100% of traffic to new system (Week 3)
- [x] 4.6.5 Compare metrics: latency, cost, satisfaction, fallback rates

### 4.7 Test Metrics & Monitoring
- [x] 4.7.1 Unit test: metrics calculated correctly
- [x] 4.7.2 Integration test: metrics logged to CloudWatch
- [x] 4.7.3 Integration test: dashboards display correctly
- [x] 4.7.4 Load test: metrics logging doesn't impact latency
- [x] 4.7.5 Verify: cost tracking accurate within 5%
- [x] 4.7.6 Verify: fallback rate tracking accurate

---

## Phase 5: Integration & Deployment (Week 4-5)

### 5.1 Update Session Handler
- [x] 5.1.1 Inject ModelRouter into SubmitSpeakingTurnUseCase
- [x] 5.1.2 Inject ScaffoldingSystem into SubmitSpeakingTurnUseCase
- [x] 5.1.3 Update BedrockConversationGenerationService to use new prompt
- [x] 5.1.4 Update BedrockConversationGenerationService to use streaming
- [x] 5.1.5 Update error handling for new models

### 5.2 Update Data Models
- [x] 5.2.1 Add `assigned_model` field to Session
- [x] 5.2.2 Add metrics fields to Session (avg_ttft, avg_tokens, cost)
- [x] 5.2.3 Add metrics fields to Turn (ttft, latency, tokens, cost)
- [x] 5.2.4 Add `delivery_cue` field to Turn
- [x] 5.2.5 Migrate existing sessions (set model based on level)

### 5.3 Update Frontend
- [x] 5.3.1 Display delivery cues in UI (optional, for debugging)
- [x] 5.3.2 Show hint when available (for A1-A2)
- [x] 5.3.3 Display response streaming (progressive text display)
- [x] 5.3.4 Show latency metrics (optional, for debugging)
- [x] 5.3.5 Test UI with all proficiency levels

### 5.4 Deployment & Rollout
- [ ] 5.4.1 Deploy to staging environment
- [ ] 5.4.2 Run full integration tests
- [ ] 5.4.3 Deploy to production (canary: 10% A1-A2)
- [ ] 5.4.4 Monitor metrics for 24 hours
- [ ] 5.4.5 Gradually increase traffic (50% → 100%)

### 5.5 Rollback Plan
- [ ] 5.5.1 If TTFT > 600ms: disable streaming
- [ ] 5.5.2 If cost > $0.02/session: reduce fallback rates (increase Micro threshold)
- [ ] 5.5.3 If satisfaction < 3.5/5.0: revert to Claude Haiku
- [ ] 5.5.4 If fallback > target + 10%: investigate quality issues, adjust validation rules
- [ ] 5.5.5 Document rollback procedure
- [ ] 5.5.6 Test rollback procedure

---

## Phase 6: Optimization & Tuning (Week 5+)

### 6.1 Performance Tuning
- [ ] 6.1.1 Analyze TTFT distribution, identify bottlenecks
- [ ] 6.1.2 Optimize prompt size (reduce unnecessary context)
- [ ] 6.1.3 Tune temperature per level based on response quality
- [ ] 6.1.4 Optimize streaming chunk size
- [ ] 6.1.5 Test: TTFT < 300ms (new target)

### 6.2 Cost Optimization
- [ ] 6.2.1 Analyze cost per level, identify opportunities
- [ ] 6.2.2 Consider downgrading B1 to Micro if quality acceptable
- [ ] 6.2.3 Implement prompt caching for common scenarios
- [ ] 6.2.4 Use batch inference for non-real-time use cases
- [ ] 6.2.5 Target: cost < $0.01/session

### 6.3 Quality Improvement
- [ ] 6.3.1 Analyze user feedback, identify quality issues
- [ ] 6.3.2 Refine few-shot examples based on real responses
- [ ] 6.3.3 Adjust personality traits based on user satisfaction
- [ ] 6.3.4 Improve scaffolding hints based on learner feedback
- [ ] 6.3.5 Target: satisfaction > 4.5/5.0

### 6.4 Monitoring & Alerting
- [ ] 6.4.1 Set up automated alerts for SLA violations
- [ ] 6.4.2 Set up automated alerts for cost overruns
- [ ] 6.4.3 Set up automated alerts for quality degradation
- [ ] 6.4.4 Create runbooks for common issues
- [ ] 6.4.5 Implement automated remediation (e.g., fallback)

---

## Success Criteria

### Performance
- [ ] TTFT < 400ms (95th percentile)
- [ ] Total latency < 2 seconds (95th percentile)
- [ ] Streaming success rate > 98%

### Quality
- [ ] Response length compliance > 95%
- [ ] Format compliance (no markdown) > 99%
- [ ] Delivery cues present > 90%
- [ ] User satisfaction > 4.2/5.0

### Cost
- [ ] Cost per session < $0.015 (vs. $0.032 current)
- [ ] Cost savings > 50% vs. Claude Haiku
- [ ] No cost overruns

### User Experience
- [ ] Beginner retention (A1-A2) > 70%
- [ ] Session completion rate > 80%
- [ ] Hint usage rate 30-50% for A1-A2

---

## Dependencies & Blockers

### External Dependencies
- [ ] AWS Bedrock Nova models available in region
- [ ] AWS Comprehend available for language detection
- [ ] AWS Bedrock Guardrails available
- [ ] CloudWatch available for metrics

### Internal Dependencies
- [ ] DynamoDB schema updated for new fields
- [ ] Frontend updated to display streaming responses
- [ ] API Gateway supports streaming responses
- [ ] Lambda timeout increased to 30 seconds (for streaming)

### Potential Blockers
- [ ] Nova Micro too weak for A2 → fallback to Lite
- [ ] Streaming latency issues → use sync mode
- [ ] Prompt caching not working → disable caching
- [ ] Guardrails blocking legitimate content → adjust filters

---

## Effort Estimation

| Phase | Tasks | Effort | Timeline |
|-------|-------|--------|----------|
| Phase 1 | 1.1-1.4 | 20 hours | Week 1 |
| Phase 2 | 2.1-2.6 | 30 hours | Week 2 |
| Phase 3 | 3.1-3.5 | 20 hours | Week 3 |
| Phase 4 | 4.1-4.7 | 25 hours | Week 4 |
| Phase 5 | 5.1-5.5 | 15 hours | Week 4-5 |
| Phase 6 | 6.1-6.4 | 15 hours | Week 5+ |
| **Total** | **30+ tasks** | **~125 hours** | **4-5 weeks** |

---

## Notes

- All tasks should include unit tests and integration tests
- Code should follow existing project conventions (Python, Clean Architecture)
- All changes should be backward compatible (feature flags for gradual rollout)
- Metrics should be logged for all changes (for A/B testing)
- Documentation should be updated as we go

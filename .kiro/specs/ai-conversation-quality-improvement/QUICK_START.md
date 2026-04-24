# Quick Start: Scenario B Implementation

## What is Scenario B?

**Nova Micro for All + Fallback Strategy**

- Primary model: Nova Micro for all proficiency levels (A1-C2)
- Fallback logic: Automatic fallback to Lite (B1-B2) or Pro (C1-C2) if quality validation fails
- Cost: ~$0.0099/session (69% savings vs. Claude Haiku)
- Quality: Maintained through fallback strategy + quality validation

---

## Key Decision Points

### Why Micro for All?
- **Cost:** Micro is 10x cheaper than Pro for input, 8x cheaper for output
- **Quality:** A1-A2 learners don't need sophisticated responses
- **Fallback:** Advanced learners get Lite/Pro when needed

### Why Fallback Strategy?
- **Quality Assurance:** Ensures advanced learners get quality responses
- **Cost Optimization:** Minimizes fallback usage through quality validation
- **Flexibility:** Easy to adjust fallback rates based on real-world data

### Why Not Multi-Model Routing (Scenario C)?
- **Cost:** Scenario B saves 69% vs. Scenario C's 53%
- **Latency:** Only 70ms difference (not worth $44k/year extra cost)
- **Simplicity:** Scenario B is simpler to implement and monitor

---

## Model Routing Matrix

```
A1-A2 → Micro (no fallback needed)
B1 → Micro (5% fallback to Lite)
B2 → Micro (10% fallback to Lite)
C1 → Micro (30% fallback to Pro)
C2 → Micro (40% fallback to Pro)
```

---

## Fallback Triggers

1. **Quality Validation Failure:** Response doesn't meet quality standards
2. **Timeout:** Micro model takes > 5 seconds
3. **Error:** Micro model returns error

---

## Implementation Phases

### Phase 1: Prompt Optimization (Week 1)
- Implement 5-section prompt structure
- Add level-adaptive personality traits
- Add delivery cues and few-shot examples
- **Deliverable:** New prompt template

### Phase 2: Model Routing & Streaming (Week 2)
- Implement ModelRouter (Micro primary + fallback)
- Implement ResponseValidator (quality validation)
- Implement streaming with InvokeModelWithResponseStream
- Implement prompt caching
- **Deliverable:** Streaming responses, TTFT < 400ms, fallback working

### Phase 3: Scaffolding & Guardrails (Week 3)
- Implement bilingual scaffolding system
- Implement Vietnamese detection
- Implement off-topic redirect logic
- Implement Bedrock Guardrails
- **Deliverable:** Hints for A1-A2, guardrails active

### Phase 4: Metrics & Monitoring (Week 4)
- Implement metrics logging (including fallback rate)
- Implement fallback rate monitoring
- Set up CloudWatch dashboards
- Implement A/B testing
- **Deliverable:** Dashboards, cost tracking, fallback rate monitoring

### Phase 5: Integration & Deployment (Week 4-5)
- Update session handler
- Update data models
- Update frontend
- Canary rollout (10% → 50% → 100%)
- **Deliverable:** Production deployment, monitoring active

### Phase 6: Optimization & Tuning (Week 5+)
- Performance tuning (TTFT < 300ms)
- Cost optimization (< $0.01/session)
- Quality improvement (satisfaction > 4.5/5.0)
- Automated monitoring & alerting
- **Deliverable:** Optimized system, runbooks

---

## Key Files to Modify

### Backend (lexi-be)
- `src/domain/services/prompt_builder.py` - Implement 5-section prompt structure
- `src/infrastructure/services/speaking_pipeline_services.py` - Implement streaming + fallback
- `src/application/use_cases/speaking_session_use_cases.py` - Inject ModelRouter + ResponseValidator
- `src/infrastructure/services/bedrock_conversation_generation_service.py` - Implement streaming + caching

### Frontend (lexi-fe)
- `app/components/SpeakingSession.tsx` - Display streaming responses
- `app/components/HintDisplay.tsx` - Display bilingual hints for A1-A2

### Infrastructure
- CloudWatch dashboards for latency, cost, quality, fallback rates
- DynamoDB schema updates for new metrics fields

---

## Success Criteria

### Cost
- ✓ Cost per session < $0.01 (target: $0.0099)
- ✓ Cost savings > 60% vs. Claude Haiku (target: 69%)

### Quality
- ✓ Response length compliance > 95%
- ✓ Format compliance (no markdown) > 99%
- ✓ Delivery cues present > 90%
- ✓ User satisfaction > 4.2/5.0

### Fallback Rates
- ✓ A1-A2: 0% fallback
- ✓ B1: 5% fallback
- ✓ B2: 10% fallback
- ✓ C1: 30% fallback
- ✓ C2: 40% fallback

### Performance
- ✓ TTFT < 400ms (95th percentile)
- ✓ Total latency < 2 seconds (95th percentile)
- ✓ Streaming success rate > 98%

---

## Rollback Plan

If any of these conditions occur, rollback to previous system:

- **TTFT > 600ms:** Disable streaming, use sync mode
- **Cost > $0.02/session:** Reduce fallback rates (increase Micro threshold)
- **Satisfaction < 3.5/5.0:** Revert to Claude Haiku
- **Fallback > target + 10%:** Investigate quality issues, adjust validation rules

---

## Monitoring & Alerts

### Key Metrics to Monitor
- TTFT (Time To First Token)
- Total latency
- Response token count
- Model used (Micro, Lite, Pro)
- Model source (primary or fallback)
- Fallback reason (validation failed, timeout, error)
- Cost per session
- Quality score
- User satisfaction

### CloudWatch Dashboards
1. **Latency Dashboard:** TTFT, total latency, streaming success rate
2. **Cost Dashboard:** Cost per session, cost per level, cost savings
3. **Quality Dashboard:** Response compliance, delivery cues, quality score
4. **Fallback Dashboard:** Fallback rates per level, fallback reasons
5. **Usage Dashboard:** Sessions, turns, models used

### Alerts
- TTFT > 600ms
- Cost > $0.02/session
- Fallback rate > target + 10%
- Satisfaction < 3.5/5.0
- Streaming success rate < 98%

---

## Testing Strategy

### Unit Tests
- Model routing logic (correct model per level)
- Quality validation (correct rules per level)
- Prompt building (all 5 sections present)
- Scaffolding hints (correct level, bilingual format)

### Integration Tests
- End-to-end flow (user input → model → response → TTS)
- Streaming (tokens arrive incrementally)
- Prompt caching (cache hits reduce latency)
- Fallback (quality validation fails → fallback works)

### Performance Tests
- TTFT for Micro model
- Total latency for different response lengths
- Cost per session by level
- Cache hit rate
- Fallback rate by level

### User Acceptance Tests
- A1-A2 learners: scaffolding helpful?
- B1-B2 learners: responses natural?
- C1-C2 learners: responses sophisticated?
- All levels: satisfaction > 4.0/5.0?

---

## Effort & Timeline

| Phase | Effort | Timeline |
|-------|--------|----------|
| Phase 1 | 20 hours | Week 1 |
| Phase 2 | 30 hours | Week 2 |
| Phase 3 | 20 hours | Week 3 |
| Phase 4 | 25 hours | Week 4 |
| Phase 5 | 15 hours | Week 4-5 |
| Phase 6 | 15 hours | Week 5+ |
| **Total** | **~125 hours** | **4-5 weeks** |

---

## Configuration

### Environment Variables
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

# Quality Validation
ENABLE_QUALITY_VALIDATION=true
FALLBACK_ENABLED=true

# Metrics
CLOUDWATCH_NAMESPACE=Lexi/ConversationQuality
LOG_METRICS=true

# Guardrails
BEDROCK_GUARDRAIL_ID=<guardrail-id>
ENABLE_GUARDRAILS=true

# Feature Flags
ENABLE_NEW_SYSTEM=true
NEW_SYSTEM_TRAFFIC_PERCENTAGE=100  # 10 → 50 → 100
```

---

## Canary Rollout Strategy

### Week 1-2: 10% of A1-A2 Learners
- Deploy Micro model (no fallback)
- Monitor: TTFT, cost, satisfaction, fallback rate
- Rollback if: TTFT > 600ms, cost > $0.01, satisfaction < 3.5/5.0

### Week 2-3: 50% of A1-A2, 10% of B1-B2
- Deploy Micro + Lite fallback
- Monitor: Same metrics
- Rollback if: Same thresholds

### Week 3-4: 100% of Learners
- Deploy Micro + Lite/Pro fallback
- Monitor: All metrics
- Optimize based on feedback

---

## References

- **Design Document:** `design.md`
- **Implementation Tasks:** `tasks.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Research Notes:** `RESEARCH_NOTES.md`
- **Scenario B Decision:** `RESEARCH_NOTES.md` (Scenario B Decision section)
- **Completion Summary:** `SCENARIO_B_COMPLETION_SUMMARY.md`

---

## Questions?

Refer to the detailed spec documents:
- **Design questions:** See `design.md`
- **Task details:** See `tasks.md`
- **Cost analysis:** See `IMPLEMENTATION_SUMMARY.md`
- **Research findings:** See `RESEARCH_NOTES.md`
- **Decision rationale:** See `RESEARCH_NOTES.md` (Scenario B Decision section)

---

## Ready to Start?

1. Review this Quick Start guide
2. Read the full spec documents (design.md, tasks.md)
3. Start with Phase 1: Prompt Optimization
4. Follow the implementation tasks in tasks.md
5. Monitor metrics continuously
6. Optimize based on real-world data

**Good luck! 🚀**

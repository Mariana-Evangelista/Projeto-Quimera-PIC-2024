import { describe, it, expect } from 'vitest'
import { BODY_WATER_LOSS_ANSWER_KEY } from '@/modules/body-water-loss-response/constants/body-water-loss-response.answer-key'
import { GLYCEMIC_CONTROL_ANSWER_KEY } from '@/modules/glycemic-control-response/constants/glycemic-control-response.answer-key'

function validatePin(pin: unknown): boolean {
  return typeof pin === 'string' && pin.trim().length === 6
}

function extractValue(input: unknown): string {
  const raw = typeof input === 'string' ? input : (input as { value?: unknown } | null)?.value
  if (typeof raw !== 'string' || raw.trim() === '' || raw.length > 100) {
    throw new Error('Resposta inválida')
  }
  return raw.trim().normalize('NFC')
}

function buildBWLScored(rawOne: unknown, rawTwo: unknown) {
  const v1 = extractValue(rawOne)
  const v2 = extractValue(rawTwo)
  return {
    answerOne: { value: v1, weight: v1 === BODY_WATER_LOSS_ANSWER_KEY.answerOne.value ? BODY_WATER_LOSS_ANSWER_KEY.answerOne.weight : 0 },
    answerTwo: { value: v2, weight: v2 === BODY_WATER_LOSS_ANSWER_KEY.answerTwo.value ? BODY_WATER_LOSS_ANSWER_KEY.answerTwo.weight : 0 },
    score: 0
  }
}

function buildGCScored(answers: unknown) {
  const total = Object.keys(GLYCEMIC_CONTROL_ANSWER_KEY).length
  if (!Array.isArray(answers) || answers.length !== total) throw new Error('qtd questões')
  const seen = new Set<number>()
  return answers.map((a) => {
    const q = Number(a?.question)
    const key = Number.isInteger(q) ? GLYCEMIC_CONTROL_ANSWER_KEY[q] : undefined
    const ans = typeof a?.answer === 'string' ? a.answer.trim() : ''
    if (!key || !ans || ans.length > 100 || seen.has(q)) throw new Error('inválida')
    seen.add(q)
    return { question: q, answer: ans, weight: ans === key.value ? key.weight : 0 }
  })
}

describe('PIN validation (6 chars exatos)', () => {
  const valids = ['abc123', 'ABCDEF', '123456', 'a1b2c3']
  const invalids = ['', 'abc12', 'abc1234', 123456, null, undefined, {}, [], { $ne: null }]

  it.each(valids)('aceita "%s"', (p) => expect(validatePin(p)).toBe(true))
  it.each(invalids)('rejeita %j', (p) => expect(validatePin(p)).toBe(false))
})

describe('Body Water Loss — extractValue + buildScoredAnswers', () => {
  it('string direta', () => {
    expect(extractValue('Hipotálamo')).toBe('Hipotálamo')
    expect(extractValue('ADH')).toBe('ADH')
  })

  it('objeto {value}', () => {
    expect(extractValue({ value: 'Hipotálamo' })).toBe('Hipotálamo')
  })

  it('rejeita vazio/longo', () => {
    expect(() => extractValue('')).toThrow('Resposta inválida')
    expect(() => extractValue('x'.repeat(101))).toThrow('Resposta inválida')
  })

  it('score 100 (ambas corretas)', () => {
    const r = buildBWLScored('Hipotálamo', 'ADH')
    r.score = r.answerOne.weight + r.answerTwo.weight
    expect(r.score).toBe(100)
  })

  it('score 20 (só answerOne)', () => {
    const r = buildBWLScored('Hipotálamo', 'errado')
    r.score = r.answerOne.weight + r.answerTwo.weight
    expect(r.score).toBe(20)
  })

  it('score 80 (só answerTwo)', () => {
    const r = buildBWLScored('errado', 'ADH')
    r.score = r.answerOne.weight + r.answerTwo.weight
    expect(r.score).toBe(80)
  })

  it('score 0 (nenhuma)', () => {
    const r = buildBWLScored('x', 'y')
    r.score = r.answerOne.weight + r.answerTwo.weight
    expect(r.score).toBe(0)
  })
})

describe('Glycemic Control — buildScoredAnswers', () => {
  const validAnswers = [
    { question: 1, answer: 'b' },
    { question: 2, answer: 'b' },
    { question: 3, answer: 'c' },
    { question: 4, answer: 'c' },
    { question: 5, answer: 'a' },
  ]

  it('100 (todas corretas)', () => {
    const r = buildGCScored(validAnswers)
    expect(r.reduce((s, a) => s + a.weight, 0)).toBe(100)
  })

  it('parcial (3/5)', () => {
    const r = buildGCScored([
      validAnswers[0],
      validAnswers[1],
      { question: 3, answer: 'x' },
      validAnswers[3],
      { question: 5, answer: 'x' }
    ])
    expect(r.reduce((s, a) => s + a.weight, 0)).toBe(60)
  })

  it('rejeita duplicata', () => {
    const withDup = [
      { question: 1, answer: 'b' },
      { question: 1, answer: 'b' }, // duplicate question 1
      { question: 3, answer: 'c' },
      { question: 4, answer: 'c' },
      { question: 5, answer: 'a' },
    ]
    expect(() => buildGCScored(withDup)).toThrow('inválida')
  })

  it('rejeita resposta vazia/longa', () => {
    expect(() => buildGCScored([{ question: 1, answer: '' }, ...validAnswers.slice(1)])).toThrow('inválida')
    expect(() => buildGCScored([{ question: 1, answer: 'x'.repeat(101) }, ...validAnswers.slice(1)])).toThrow('inválida')
  })

  it('rejeita array tamanho errado', () => {
    expect(() => buildGCScored(validAnswers.slice(0, 4))).toThrow('qtd questões')
  })

  it('ignora weight do input', () => {
    const r = buildGCScored([{ question: 1, answer: 'b', weight: 999 }, ...validAnswers.slice(1)])
    expect(r[0].weight).toBe(20)
  })
})
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const body_water_loss_response_answer_key_1 = require("@/modules/body-water-loss-response/constants/body-water-loss-response.answer-key");
const glycemic_control_response_answer_key_1 = require("@/modules/glycemic-control-response/constants/glycemic-control-response.answer-key");
function validatePin(pin) {
    return typeof pin === 'string' && pin.trim().length === 6;
}
function extractValue(input) {
    const raw = typeof input === 'string' ? input : input === null || input === void 0 ? void 0 : input.value;
    if (typeof raw !== 'string' || raw.trim() === '' || raw.length > 100) {
        throw new Error('Resposta inválida');
    }
    return raw.trim().normalize('NFC');
}
function buildBWLScored(rawOne, rawTwo) {
    const v1 = extractValue(rawOne);
    const v2 = extractValue(rawTwo);
    return {
        answerOne: { value: v1, weight: v1 === body_water_loss_response_answer_key_1.BODY_WATER_LOSS_ANSWER_KEY.answerOne.value ? body_water_loss_response_answer_key_1.BODY_WATER_LOSS_ANSWER_KEY.answerOne.weight : 0 },
        answerTwo: { value: v2, weight: v2 === body_water_loss_response_answer_key_1.BODY_WATER_LOSS_ANSWER_KEY.answerTwo.value ? body_water_loss_response_answer_key_1.BODY_WATER_LOSS_ANSWER_KEY.answerTwo.weight : 0 },
        score: 0
    };
}
function buildGCScored(answers) {
    const total = Object.keys(glycemic_control_response_answer_key_1.GLYCEMIC_CONTROL_ANSWER_KEY).length;
    if (!Array.isArray(answers) || answers.length !== total)
        throw new Error('qtd questões');
    const seen = new Set();
    return answers.map((a) => {
        const q = Number(a === null || a === void 0 ? void 0 : a.question);
        const key = Number.isInteger(q) ? glycemic_control_response_answer_key_1.GLYCEMIC_CONTROL_ANSWER_KEY[q] : undefined;
        const ans = typeof (a === null || a === void 0 ? void 0 : a.answer) === 'string' ? a.answer.trim() : '';
        if (!key || !ans || ans.length > 100 || seen.has(q))
            throw new Error('inválida');
        seen.add(q);
        return { question: q, answer: ans, weight: ans === key.value ? key.weight : 0 };
    });
}
(0, vitest_1.describe)('PIN validation (6 chars exatos)', () => {
    const valids = ['abc123', 'ABCDEF', '123456', 'a1b2c3'];
    const invalids = ['', 'abc12', 'abc1234', 123456, null, undefined, {}, [], { $ne: null }];
    vitest_1.it.each(valids)('aceita "%s"', (p) => (0, vitest_1.expect)(validatePin(p)).toBe(true));
    vitest_1.it.each(invalids)('rejeita %j', (p) => (0, vitest_1.expect)(validatePin(p)).toBe(false));
});
(0, vitest_1.describe)('Body Water Loss — extractValue + buildScoredAnswers', () => {
    (0, vitest_1.it)('string direta', () => {
        (0, vitest_1.expect)(extractValue('Hipotálamo')).toBe('Hipotálamo');
        (0, vitest_1.expect)(extractValue('ADH')).toBe('ADH');
    });
    (0, vitest_1.it)('objeto {value}', () => {
        (0, vitest_1.expect)(extractValue({ value: 'Hipotálamo' })).toBe('Hipotálamo');
    });
    (0, vitest_1.it)('rejeita vazio/longo', () => {
        (0, vitest_1.expect)(() => extractValue('')).toThrow('Resposta inválida');
        (0, vitest_1.expect)(() => extractValue('x'.repeat(101))).toThrow('Resposta inválida');
    });
    (0, vitest_1.it)('score 100 (ambas corretas)', () => {
        const r = buildBWLScored('Hipotálamo', 'ADH');
        r.score = r.answerOne.weight + r.answerTwo.weight;
        (0, vitest_1.expect)(r.score).toBe(100);
    });
    (0, vitest_1.it)('score 20 (só answerOne)', () => {
        const r = buildBWLScored('Hipotálamo', 'errado');
        r.score = r.answerOne.weight + r.answerTwo.weight;
        (0, vitest_1.expect)(r.score).toBe(20);
    });
    (0, vitest_1.it)('score 80 (só answerTwo)', () => {
        const r = buildBWLScored('errado', 'ADH');
        r.score = r.answerOne.weight + r.answerTwo.weight;
        (0, vitest_1.expect)(r.score).toBe(80);
    });
    (0, vitest_1.it)('score 0 (nenhuma)', () => {
        const r = buildBWLScored('x', 'y');
        r.score = r.answerOne.weight + r.answerTwo.weight;
        (0, vitest_1.expect)(r.score).toBe(0);
    });
});
(0, vitest_1.describe)('Glycemic Control — buildScoredAnswers', () => {
    const validAnswers = [
        { question: 1, answer: 'b' },
        { question: 2, answer: 'b' },
        { question: 3, answer: 'c' },
        { question: 4, answer: 'c' },
        { question: 5, answer: 'a' },
    ];
    (0, vitest_1.it)('100 (todas corretas)', () => {
        const r = buildGCScored(validAnswers);
        (0, vitest_1.expect)(r.reduce((s, a) => s + a.weight, 0)).toBe(100);
    });
    (0, vitest_1.it)('parcial (3/5)', () => {
        const r = buildGCScored([
            validAnswers[0],
            validAnswers[1],
            { question: 3, answer: 'x' },
            validAnswers[3],
            { question: 5, answer: 'x' }
        ]);
        (0, vitest_1.expect)(r.reduce((s, a) => s + a.weight, 0)).toBe(60);
    });
    (0, vitest_1.it)('rejeita duplicata', () => {
        const withDup = [
            { question: 1, answer: 'b' },
            { question: 1, answer: 'b' }, // duplicate question 1
            { question: 3, answer: 'c' },
            { question: 4, answer: 'c' },
            { question: 5, answer: 'a' },
        ];
        (0, vitest_1.expect)(() => buildGCScored(withDup)).toThrow('inválida');
    });
    (0, vitest_1.it)('rejeita resposta vazia/longa', () => {
        (0, vitest_1.expect)(() => buildGCScored([{ question: 1, answer: '' }, ...validAnswers.slice(1)])).toThrow('inválida');
        (0, vitest_1.expect)(() => buildGCScored([{ question: 1, answer: 'x'.repeat(101) }, ...validAnswers.slice(1)])).toThrow('inválida');
    });
    (0, vitest_1.it)('rejeita array tamanho errado', () => {
        (0, vitest_1.expect)(() => buildGCScored(validAnswers.slice(0, 4))).toThrow('qtd questões');
    });
    (0, vitest_1.it)('ignora weight do input', () => {
        const r = buildGCScored([{ question: 1, answer: 'b', weight: 999 }, ...validAnswers.slice(1)]);
        (0, vitest_1.expect)(r[0].weight).toBe(20);
    });
});

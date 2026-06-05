const QUESTION_TYPES = {
  MCQ:          'mcq',
  TRUE_FALSE:   'true_false',
  FILL_BLANK:   'fill_blank',
  SHORT_ANSWER: 'short_answer',
  MATCHING:     'matching',
  ORDERING:     'ordering',
  ESSAY:        'essay',
}

const AUTO_GRADED  = ['mcq', 'true_false', 'fill_blank', 'matching', 'ordering']
const MANUAL_GRADED = ['short_answer', 'essay']

module.exports = { QUESTION_TYPES, AUTO_GRADED, MANUAL_GRADED }

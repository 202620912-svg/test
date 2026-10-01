import { useEffect, useState } from 'react'
import WELDING_2014_EXTRA from './weldingQuestions.js'

const SUBJECTS = [
  '에너지관리기능사',
  '가스기능사',
  '용접기능사',
  '침투비파괴검사기능사',
  '공조냉동기계기능사',
]

const YEARS = Array.from({ length: 13 }, (_, index) => 2014 + index)

const INITIAL_QUESTIONS = [
  {
    id: 'welding-2014-1',
    subject: '용접기능사',
    year: 2014,
    session: 1,
    question: '피복 아크 용접에서 용접봉 피복제의 주된 역할로 가장 적절한 것은?',
    options: ['용접 전류를 일정하게 저장한다', '아크와 용융 금속을 대기로부터 보호한다', '모재를 냉각해 용접 속도를 높인다', '용접부의 전기 저항을 높인다'],
    answer: 1,
    explanation: '피복제는 아크 주변에 보호 가스를 만들고 슬래그를 형성해 용융 금속을 대기 오염으로부터 보호합니다.',
  },
  {
    id: 'welding-2014-2',
    subject: '용접기능사',
    year: 2014,
    session: 1,
    question: '아크 용접에서 아크 길이가 지나치게 길 때 나타나기 쉬운 현상은?',
    options: ['스패터와 기공이 증가한다', '용접 전류가 항상 0이 된다', '용접봉이 모재에 붙지 않는다', '모재의 열변형이 완전히 없어진다'],
    answer: 0,
    explanation: '아크가 지나치게 길면 아크가 불안정해지고 대기 차폐가 약해져 스패터나 기공이 발생하기 쉽습니다.',
  },
  {
    id: 'welding-2014-3',
    subject: '용접기능사',
    year: 2014,
    session: 1,
    question: '불활성 가스 텅스텐 아크 용접(TIG)에 대한 설명으로 옳은 것은?',
    options: ['용가재가 전극 역할을 한다', '텅스텐 전극은 소모되지 않는 전극으로 사용한다', '차폐 가스를 사용하지 않는다', '전극 피복제가 슬래그를 만든다'],
    answer: 1,
    explanation: 'TIG 용접은 소모되지 않는 텅스텐 전극과 아르곤 등의 불활성 차폐 가스를 사용합니다. 필요하면 별도의 용가재를 공급합니다.',
  },
  {
    id: 'welding-2014-4',
    subject: '용접기능사',
    year: 2014,
    session: 1,
    question: '용접부에 기공이 발생하는 원인으로 가장 적절한 것은?',
    options: ['모재와 용접봉의 표면에 수분이나 오염물이 남아 있다', '용접부를 적절히 청소했다', '차폐 가스가 용접부를 잘 덮고 있다', '용접 조건을 작업 지침에 맞췄다'],
    answer: 0,
    explanation: '모재나 용접봉의 수분·기름·녹, 불충분한 가스 차폐 등은 용접 금속에 기공을 일으킬 수 있습니다.',
  },
  {
    id: 'welding-2014-5',
    subject: '용접기능사',
    year: 2014,
    session: 1,
    question: '용접 작업을 시작하기 전에 우선 확인해야 할 안전 사항은?',
    options: ['보호면과 장갑 등 보호구의 착용 상태', '작업복 소매를 걷어 올렸는지 여부', '주변의 인화물을 아크 가까이에 모았는지 여부', '용접 케이블 피복을 벗겨 두었는지 여부'],
    answer: 0,
    explanation: '용접 전에는 용접면·장갑 등 적절한 보호구를 착용하고, 주변 가연물을 정리하며 장비와 케이블 상태도 점검해야 합니다.',
  },
]

const QUESTIONS = [
  ...INITIAL_QUESTIONS,
  ...WELDING_2014_EXTRA.map((question, index) => ({
    ...question,
    id: `welding-2014-${index + INITIAL_QUESTIONS.length + 1}`,
    subject: '용접기능사',
    year: 2014,
    session: 1,
  })),
]

const STORAGE_KEY = 'gineungsa-exam-progress-v2'
const CUSTOM_QUESTIONS_KEY = 'gineungsa-custom-questions-v1'

function sessionsForYear(year) {
  return year <= 2016 ? [1, 2, 4, 5] : [1, 2]
}

function readCustomQuestions() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_QUESTIONS_KEY)) || []
  } catch {
    return []
  }
}

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
    return {
      favorites: Array.isArray(saved.favorites) ? saved.favorites : [],
      bestScore: Number.isFinite(saved.bestScore) ? saved.bestScore : null,
      attempts: Number.isFinite(saved.attempts) ? saved.attempts : 0,
      wrongQuestionIds: Array.isArray(saved.wrongQuestionIds) ? saved.wrongQuestionIds : [],
    }
  } catch {
    return { favorites: [], bestScore: null, attempts: 0, wrongQuestionIds: [] }
  }
}

function shuffle(items) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled
}

function shuffleQuestionOptions(question) {
  const options = shuffle(question.options.map((text, index) => ({
    text,
    isAnswer: index === question.answer,
  })))
  return {
    ...question,
    options: options.map((option) => option.text),
    answer: options.findIndex((option) => option.isAnswer),
  }
}

function App() {
  const [screen, setScreen] = useState('home')
  const [quizMode, setQuizMode] = useState('practice')
  const [selectedSubject, setSelectedSubject] = useState('용접기능사')
  const [selectedYear, setSelectedYear] = useState(2014)
  const [selectedSession, setSelectedSession] = useState(1)
  const [customQuestions, setCustomQuestions] = useState(readCustomQuestions)
  const [questionForm, setQuestionForm] = useState({
    subject: '용접기능사',
    year: 2014,
    session: 1,
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
  })
  const [formNotice, setFormNotice] = useState('')
  const [answers, setAnswers] = useState({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionIds, setQuestionIds] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])
  const [progress, setProgress] = useState(readProgress)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(customQuestions))
  }, [customQuestions])

  const allQuestions = [...QUESTIONS, ...customQuestions]
  const sessionOptions = sessionsForYear(selectedYear)
  const formSessionOptions = sessionsForYear(questionForm.year)
  const selectedQuestions = allQuestions.filter((question) =>
    question.subject === selectedSubject &&
    question.year === selectedYear &&
    question.session === selectedSession,
  )
  const subjectQuestions = allQuestions.filter((question) => question.subject === selectedSubject)
  const currentQuestion = quizQuestions[questionIndex]
  const correctCount = quizQuestions.reduce(
    (total, question) => total + (answers[question.id] === question.answer ? 1 : 0),
    0,
  )
  const answeredCount = quizQuestions.filter((question) => answers[question.id] !== undefined).length
  const accuracy = quizQuestions.length ? Math.round((correctCount / quizQuestions.length) * 100) : 0

  const startQuiz = (ids = selectedQuestions.map((question) => question.id), mode = 'practice') => {
    if (!ids.length) return
    const randomizedQuestions = shuffle(ids)
      .map((id) => allQuestions.find((question) => question.id === id))
      .filter(Boolean)
      .map(shuffleQuestionOptions)
    setQuestionIds(randomizedQuestions.map((question) => question.id))
    setQuizQuestions(randomizedQuestions)
    setQuestionIndex(0)
    setAnswers({})
    setQuizMode(mode)
    setScreen('quiz')
  }

  const startYearExam = () => {
    if (selectedQuestions.length < 60) return
    const shuffledIds = shuffle(selectedQuestions.map((question) => question.id)).slice(0, 60)
    startQuiz(shuffledIds, 'year')
  }

  const changeYear = (event) => {
    setSelectedYear(Number(event.target.value))
    setSelectedSession(1)
  }

  const changeFormYear = (event) => {
    setQuestionForm((previous) => ({ ...previous, year: Number(event.target.value), session: 1 }))
  }

  const saveQuestion = (event) => {
    event.preventDefault()
    if (!questionForm.question.trim() || questionForm.options.some((option) => !option.trim()) || !questionForm.explanation.trim()) {
      setFormNotice('문제, 보기 4개, 정답, 해설을 모두 입력해 주세요.')
      return
    }
    const newQuestion = {
      ...questionForm,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      question: questionForm.question.trim(),
      options: questionForm.options.map((option) => option.trim()),
      explanation: questionForm.explanation.trim(),
    }
    setCustomQuestions((previous) => [...previous, newQuestion])
    setQuestionForm((previous) => ({ ...previous, question: '', options: ['', '', '', ''], answer: 0, explanation: '' }))
    setFormNotice(`${newQuestion.subject} ${newQuestion.year}년 ${newQuestion.session}회 문제를 저장했습니다.`)
  }

  const startMockExam = () => {
    if (subjectQuestions.length < 60) return
    const shuffledIds = shuffle(subjectQuestions.map((question) => question.id)).slice(0, 60)
    startQuiz(shuffledIds, 'mock')
  }

  const finishQuiz = () => {
    const attemptedIds = new Set(quizQuestions.map((question) => question.id))
    const wrongIds = quizQuestions
      .filter((question) => answers[question.id] !== question.answer)
      .map((question) => question.id)
    setProgress((previous) => ({
      ...previous,
      bestScore: previous.bestScore === null ? accuracy : Math.max(previous.bestScore, accuracy),
      attempts: previous.attempts + 1,
      wrongQuestionIds: [...new Set([
        ...previous.wrongQuestionIds.filter((id) => !attemptedIds.has(id)),
        ...wrongIds,
      ])],
    }))
    setScreen('result')
  }

  const toggleFavorite = (id) => {
    setProgress((previous) => ({
      ...previous,
      favorites: previous.favorites.includes(id)
        ? previous.favorites.filter((favoriteId) => favoriteId !== id)
        : [...previous.favorites, id],
    }))
  }

  if (screen === 'addQuestion') {
    return (
      <div className="app-shell">
        <header className="topbar">
          <button className="brand brand-button" onClick={() => setScreen('home')}>
            <span className="brand-mark">기</span><span>기능사 노트</span>
          </button>
          <button className="exit-button" onClick={() => setScreen('home')}>홈으로 <span aria-hidden="true">←</span></button>
        </header>
        <main className="question-form-layout">
          <div className="form-page-heading">
            <span className="eyebrow">QUESTION LIBRARY</span>
            <h1>문제 등록</h1>
            <p>과목, 연도, 회차를 지정하고 문제와 해설을 입력하세요.</p>
          </div>
          <form className="question-form" onSubmit={saveQuestion}>
            <div className="question-form-grid">
              <label className="form-field">
                <span>과목</span>
                <select
                  required
                  value={questionForm.subject}
                  onChange={(event) => setQuestionForm((previous) => ({ ...previous, subject: event.target.value }))}
                >
                  {SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>연도</span>
                <select required value={questionForm.year} onChange={changeFormYear}>
                  {YEARS.map((year) => <option key={year} value={year}>{year}년</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>회차</span>
                <select
                  required
                  value={questionForm.session}
                  onChange={(event) => setQuestionForm((previous) => ({ ...previous, session: Number(event.target.value) }))}
                >
                  {formSessionOptions.map((session) => <option key={session} value={session}>{session}회</option>)}
                </select>
              </label>
              <label className="form-field form-field-wide">
                <span>문제</span>
                <textarea
                  required
                  rows="3"
                  placeholder="문제 내용을 입력하세요"
                  value={questionForm.question}
                  onChange={(event) => setQuestionForm((previous) => ({ ...previous, question: event.target.value }))}
                />
              </label>
              <fieldset className="choice-fieldset form-field-wide">
                <legend>보기 입력 · 정답을 선택하세요</legend>
                {questionForm.options.map((option, index) => (
                  <div className="choice-editor" key={index}>
                    <label className="correct-choice" aria-label={`${index + 1}번을 정답으로 선택`}>
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={questionForm.answer === index}
                        onChange={() => setQuestionForm((previous) => ({ ...previous, answer: index }))}
                      />
                      <span>{String.fromCharCode(65 + index)}</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={`${index + 1}번 보기`}
                      value={option}
                      onChange={(event) => setQuestionForm((previous) => ({
                        ...previous,
                        options: previous.options.map((value, optionIndex) => optionIndex === index ? event.target.value : value),
                      }))}
                    />
                  </div>
                ))}
              </fieldset>
              <label className="form-field form-field-wide">
                <span>해설</span>
                <textarea
                  required
                  rows="4"
                  placeholder="정답의 근거나 풀이를 입력하세요"
                  value={questionForm.explanation}
                  onChange={(event) => setQuestionForm((previous) => ({ ...previous, explanation: event.target.value }))}
                />
              </label>
            </div>
            <div className="form-footer">
              <p className={`form-notice ${formNotice.includes('저장했습니다') ? 'success' : ''}`} aria-live="polite">
                {formNotice || '등록한 문제는 이 브라우저에 저장되고 해당 과목·연도·회차 문제 수에 반영됩니다.'}
              </p>
              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={() => setScreen('home')}>취소</button>
                <button className="primary-button" type="submit">문제 저장</button>
              </div>
            </div>
          </form>
        </main>
      </div>
    )
  }

  if (screen === 'home') {
    return (
      <div className="app-shell">
        <header className="topbar">
          <a className="brand" href="#home" onClick={(event) => event.preventDefault()}>
            <span className="brand-mark">기</span>
            <span>기능사 노트</span>
          </a>
          <button className="header-action" onClick={() => { setFormNotice(''); setScreen('addQuestion') }}>+ 문제 등록</button>
        </header>
        <main className="home-layout">
          <section className="welcome-panel">
            <div className="welcome-copy">
              <span className="eyebrow">CRAFTSMAN EXAM PREP</span>
              <h1>오늘의 연습이<br />합격에 가까워집니다.</h1>
              <p>핵심 개념을 확인하고, 문제 풀이로 실력을 점검해 보세요.</p>
              <button
                className="primary-button start-button"
                onClick={startYearExam}
                disabled={selectedQuestions.length < 60}
              >
                {selectedQuestions.length >= 60 ? '60문항 연습 시작' : '문제 준비 중'} <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-sheet">
                <span className="sheet-line line-short" />
                <span className="sheet-line" />
                <span className="sheet-line line-medium" />
                <span className="sheet-check">✓</span>
              </div>
              <span className="art-spark spark-one">✦</span>
              <span className="art-spark spark-two">✳</span>
            </div>
          </section>

          <section className="exam-picker" aria-label="시험 종목 및 연도 선택">
            <div className="picker-heading">
              <div><span className="eyebrow">CHOOSE YOUR EXAM</span><h2>시험 종목을 선택하세요</h2></div>
              <div className="picker-filters">
                <label className="year-picker">
                  <span>연도</span>
                  <select value={selectedYear} onChange={changeYear}>
                    {YEARS.map((year) => <option key={year} value={year}>{year}년</option>)}
                  </select>
                </label>
                <label className="year-picker">
                  <span>회차</span>
                  <select value={selectedSession} onChange={(event) => setSelectedSession(Number(event.target.value))}>
                    {sessionOptions.map((session) => <option key={session} value={session}>{session}회</option>)}
                  </select>
                </label>
              </div>
            </div>
            <div className="subject-list">
              {SUBJECTS.map((subject) => (
                <button
                  className={`subject-option ${selectedSubject === subject ? 'selected' : ''}`}
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  aria-pressed={selectedSubject === subject}
                >
                  <span className="subject-radio" />{subject}
                </button>
              ))}
            </div>
            <p className="selection-status">
              {selectedSubject} · {selectedYear}년 {selectedSession}회
              <span>{selectedQuestions.length ? `${selectedQuestions.length}/60문항` : '등록된 문제가 없습니다'}</span>
            </p>
          </section>

          <section className="dashboard-grid" aria-label="학습 메뉴">
            <button
              className="study-card featured-card"
              onClick={startYearExam}
              disabled={selectedQuestions.length < 60}
            >
              <span className="card-icon icon-blue">01</span>
              <span className="card-content">
                <strong>문제 풀기</strong>
                <span>{selectedQuestions.length >= 60
                  ? `${selectedSubject} · ${selectedYear}년 ${selectedSession}회에서 60문항 랜덤 출제`
                  : `${selectedQuestions.length}/60문제 · ${60 - selectedQuestions.length}문제 더 필요`}</span>
              </span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </button>
            <button className="study-card mock-card" onClick={startMockExam} disabled={subjectQuestions.length < 60}>
              <span className="card-icon icon-violet">60</span>
              <span className="card-content">
                <strong>60문항 모의고사</strong>
                <span>{subjectQuestions.length >= 60 ? '선택 과목 전체 연도에서 출제' : `${subjectQuestions.length}/60문제 · ${60 - subjectQuestions.length}문제 더 필요`}</span>
              </span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </button>
            <button
              className="study-card wrong-card"
              onClick={() => startQuiz(progress.wrongQuestionIds, 'wrong')}
              disabled={!progress.wrongQuestionIds.length}
            >
              <span className="card-icon icon-wrong">!</span>
              <span className="card-content">
                <strong>오답노트</strong>
                <span>다시 풀 문제 {progress.wrongQuestionIds.length}개</span>
              </span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </button>
            <button
              className="study-card"
              onClick={() => progress.favorites.length && startQuiz(progress.favorites)}
              disabled={!progress.favorites.length}
            >
              <span className="card-icon icon-peach">♡</span>
              <span className="card-content">
                <strong>즐겨찾기</strong>
                <span>저장한 문제 {progress.favorites.length}개</span>
              </span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </button>
            <div className="stat-card">
              <span className="stat-label">최고 점수</span>
              <strong>{progress.bestScore === null ? '—' : `${progress.bestScore}%`}</strong>
              <span className="stat-caption">{progress.attempts ? `${progress.attempts}회 연습 완료` : '첫 연습을 시작해 보세요'}</span>
            </div>
          </section>
          <p className="disclaimer">용접기능사 2014년 1회 60문제는 학습용으로 작성한 문제이며 공식 기출문제 원문이 아닙니다. 직접 문제를 등록하면 해당 연도·회차에 포함됩니다.</p>
        </main>
        <footer className="footer">기능사 노트 <span>·</span> 꾸준한 연습을 위한 나만의 학습 공간</footer>
      </div>
    )
  }

  if (screen === 'result') {
    const wrongQuestions = quizQuestions.filter((question) => answers[question.id] !== question.answer)
    return (
      <div className="app-shell">
        <header className="topbar">
          <button className="brand brand-button" onClick={() => setScreen('home')}>
            <span className="brand-mark">기</span><span>기능사 노트</span>
          </button>
          <span className="topbar-label">학습 결과</span>
        </header>
        <main className="result-layout">
          <section className="result-hero">
            <span className="eyebrow">PRACTICE COMPLETE</span>
            <h1>{accuracy >= 80 ? '훌륭해요!' : '한 걸음 더 나아갔어요.'}</h1>
            <p>{quizMode === 'wrong'
              ? `${quizQuestions.length}개 오답을 복습했습니다.`
              : quizMode === 'mock'
              ? `${selectedSubject} 60문항 모의고사 결과입니다.`
              : quizMode === 'year'
                ? `${selectedSubject} ${selectedYear}년 ${selectedSession}회 60문항 연습 결과입니다.`
                : '오늘의 연습 결과를 확인해 보세요.'}</p>
            <div className="score-ring" style={{ '--score': `${accuracy}%` }}>
              <div><strong>{accuracy}<small>%</small></strong><span>정답률</span></div>
            </div>
            <div className="result-counts">
              <div><strong>{correctCount}</strong><span>정답</span></div>
              <div><strong>{quizQuestions.length - correctCount}</strong><span>오답</span></div>
              <div><strong>{quizQuestions.length}</strong><span>전체 문제</span></div>
            </div>
          </section>
          <section className="review-panel">
            <div className="review-heading">
              <div><span className="eyebrow">REVIEW</span><h2>다시 확인하기</h2></div>
              <span className="review-total">{wrongQuestions.length}문제</span>
            </div>
            {wrongQuestions.length ? (
              <div className="review-list">
                {wrongQuestions.map((question) => (
                  <article className="review-item" key={question.id}>
                    <span className="review-number">Q{String(question.id).padStart(2, '0')}</span>
                    <div><strong>{question.question}</strong><p>정답: {question.options[question.answer]}</p></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="all-correct"><span>✓</span><strong>모든 문제를 맞혔어요!</strong><p>완벽한 결과예요. 다음 연습도 이어가 보세요.</p></div>
            )}
            <div className="result-actions">
              {wrongQuestions.length > 0 && <button className="secondary-button" onClick={() => startQuiz(wrongQuestions.map((question) => question.id))}>오답 다시 풀기</button>}
              <button className="primary-button" onClick={() => startQuiz(questionIds, quizMode)}>
                {quizMode === 'wrong' ? '오답 다시 풀기' : quizMode === 'mock' ? '같은 모의고사 다시 풀기' : '전체 문제 다시 풀기'}
              </button>
              <button className="text-button" onClick={() => setScreen('home')}>홈으로</button>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell quiz-shell">
      <header className="topbar">
        <button className="brand brand-button" onClick={() => setScreen('home')}>
          <span className="brand-mark">기</span><span>기능사 노트</span>
        </button>
        <button className="exit-button" onClick={() => setScreen('home')}>연습 종료 <span aria-hidden="true">×</span></button>
      </header>
      <main className="quiz-layout">
        <div className="quiz-heading">
          <div><span className="eyebrow">{quizMode === 'mock'
            ? `${currentQuestion.subject} · 60문항 모의고사`
            : quizMode === 'wrong'
              ? '오답노트 · 다시 풀기'
            : quizMode === 'year'
              ? `${currentQuestion.subject} · ${currentQuestion.year}년 ${currentQuestion.session}회 60문항 랜덤 출제`
              : `${currentQuestion.subject} · ${currentQuestion.year}년 연습`}</span><h1>차근차근 풀어볼까요?</h1></div>
          <span className="question-counter">{String(questionIndex + 1).padStart(2, '0')} <i>/</i> {String(quizQuestions.length).padStart(2, '0')}</span>
        </div>
        <div className="progress-track"><span style={{ width: `${((questionIndex + 1) / quizQuestions.length) * 100}%` }} /></div>
        <section className="question-card">
          <div className="question-meta">
            <span className="topic-tag">{currentQuestion.subject} · {currentQuestion.year}년 {currentQuestion.session}회</span>
            <button
              className={`favorite-button ${progress.favorites.includes(currentQuestion.id) ? 'is-favorite' : ''}`}
              onClick={() => toggleFavorite(currentQuestion.id)}
              aria-label={progress.favorites.includes(currentQuestion.id) ? '즐겨찾기 해제' : '즐겨찾기 저장'}
            >
              <span aria-hidden="true">{progress.favorites.includes(currentQuestion.id) ? '♥' : '♡'}</span> 저장
            </button>
          </div>
          <h2>{currentQuestion.question}</h2>
          <div className="answer-list">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index
              return (
                <button
                  className={`answer-option ${isSelected ? 'selected' : ''}`}
                  key={option}
                  onClick={() => setAnswers((previous) => ({ ...previous, [currentQuestion.id]: index }))}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                  <span className="option-radio" />
                </button>
              )
            })}
          </div>
          {answers[currentQuestion.id] !== undefined && (
            <div className={`explanation ${answers[currentQuestion.id] === currentQuestion.answer ? 'explanation-correct' : 'explanation-wrong'}`}>
              <strong>{answers[currentQuestion.id] === currentQuestion.answer ? '정답이에요' : '다시 확인해 보세요'}</strong>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </section>
        <section className="quiz-navigation">
          <div className="question-dots" aria-label="문제 번호">
            {quizQuestions.map((question, index) => (
              <button
                className={`${index === questionIndex ? 'active' : ''} ${answers[question.id] !== undefined ? 'answered' : ''}`}
                key={question.id}
                onClick={() => setQuestionIndex(index)}
                aria-label={`${index + 1}번 문제로 이동`}
              >{index + 1}</button>
            ))}
          </div>
          <div className="nav-buttons">
            <button className="secondary-button" onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))} disabled={questionIndex === 0}>이전</button>
            {questionIndex < quizQuestions.length - 1 ? (
              <button className="primary-button" onClick={() => setQuestionIndex((index) => index + 1)}>다음 문제 <span aria-hidden="true">→</span></button>
            ) : (
              <button className="primary-button" onClick={finishQuiz} disabled={answeredCount < quizQuestions.length}>결과 확인 <span aria-hidden="true">→</span></button>
            )}
          </div>
        </section>
        {questionIndex === quizQuestions.length - 1 && answeredCount < quizQuestions.length && (
          <p className="answer-hint">모든 문제에 답하면 결과를 확인할 수 있어요. ({answeredCount}/{quizQuestions.length})</p>
        )}
      </main>
    </div>
  )
}

export default App

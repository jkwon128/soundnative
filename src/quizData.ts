export interface QuizQuestion {
  situation: string
  phrase: string
  choices: string[]
  answer: number
  hint: string
  explanation: string
}

export const quizQuestions: QuizQuestion[] = [
  {
    situation: 'The cashier says',
    phrase: 'You all set?',
    choices: ['Are you feeling okay?', 'Are you ready to check out?', 'Is it sold out?'],
    answer: 1,
    hint: '다시 생각해보세요 — 계산대에서 자주 쓰는 표현이에요.',
    explanation:
      '"You all set?"은 "준비 다 되셨어요? / 계산할까요?"라는 뜻이에요. 몸 상태를 묻는 게 아닙니다.',
  },
  {
    situation: 'A coworker says',
    phrase: 'We should grab coffee sometime!',
    choices: [
      '지금 커피 마시러 가자는 뜻',
      '그냥 친근하게 던지는 인사치레일 때가 많음',
      '커피 사다 달라는 부탁',
    ],
    answer: 1,
    hint: '다시 생각해보세요 — 구체적인 날짜나 시간이 있었나요?',
    explanation:
      '구체적인 제안(날짜·시간)이 없으면 진짜 약속이 아니라 친근함을 표현하는 인사치레일 때가 많아요. 진짜 만나고 싶으면 상대가 "How about Friday?"처럼 날짜를 말합니다.',
  },
  {
    situation: 'Your manager replies',
    phrase: "I'll look into it.",
    choices: [
      '바로 처리하겠다는 뜻',
      '확답은 아니고, 검토해보겠다(때론 완곡한 미루기)',
      '네가 알아서 하라는 뜻',
    ],
    answer: 1,
    hint: '다시 생각해보세요 — 확실한 약속처럼 들리나요, 여지를 남기는 말인가요?',
    explanation:
      '"알아볼게요"라는 뜻인데, 확답이 아니라 시간을 벌거나 완곡하게 미루는 표현일 때도 많아요. 급하면 "When can I expect an update?"로 물어보세요.',
  },
  {
    situation: 'The barista asks',
    phrase: 'Room for cream?',
    choices: [
      '크림 추가 요금 낼 거냐는 뜻',
      '우유·크림 넣을 공간을 남겨둘까라는 뜻',
      '자리가 있냐는 뜻',
    ],
    answer: 1,
    hint: '다시 생각해보세요 — 커피를 따르는 상황이에요.',
    explanation:
      '커피잔에 우유나 크림을 넣을 공간을 남겨둘지 묻는 말이에요. "Yes, please." 또는 "No, fill it up."이라고 답하면 됩니다.',
  },
  {
    situation: 'A colleague messages you',
    phrase: 'No worries if not, but could you send that over?',
    choices: [
      '안 보내도 전혀 상관없다는 뜻',
      '부드럽게 말했지만 사실 보내주길 바라는 부탁',
      '이미 받았다는 뜻',
    ],
    answer: 1,
    hint: '다시 생각해보세요 — 왜 부탁 내용을 뒤에 붙였을까요?',
    explanation:
      '"안 되면 괜찮아"라고 부드럽게 포장했지만, 실제로는 보내주길 바라는 정중한 부탁이에요. 영어권에선 부담을 줄이려고 이렇게 완곡하게 말합니다.',
  },
  {
    situation: 'A cashier greets you',
    phrase: "How's it going?",
    choices: [
      '진지하게 안부를 묻는 것',
      '"안녕하세요" 수준의 가벼운 인사',
      '무슨 일 있냐고 걱정하는 것',
    ],
    answer: 1,
    hint: '다시 생각해보세요 — 처음 보는 점원이 진짜 안부가 궁금할까요?',
    explanation:
      '실제 안부가 아니라 그냥 인사예요. 길게 답할 필요 없이 "Good, thanks! You?" 정도면 충분합니다.',
  },
  {
    situation: 'In a meeting, someone says',
    phrase: "That's an interesting idea.",
    choices: [
      '당신 아이디어가 훌륭하다는 칭찬',
      '별로라고 생각하지만 예의상 하는 말일 수 있음',
      '더 설명해달라는 요청',
    ],
    answer: 1,
    hint: '다시 생각해보세요 — 항상 칭찬일까요? 톤에 따라 다를 수 있어요.',
    explanation:
      '진짜 흥미롭다는 뜻일 수도 있지만, 회의에서는 완곡하게 반대하거나 유보할 때 자주 쓰는 표현이에요. 뒤에 "but..."이 따라오면 특히 그렇습니다.',
  },
  {
    situation: 'Someone you just met says',
    phrase: 'We should hang out!',
    choices: [
      '구체적으로 약속을 잡자는 뜻',
      '호감의 표현이지만 실제 계획은 아닐 때가 많음',
      '지금 같이 가자는 뜻',
    ],
    answer: 1,
    hint: '다시 생각해보세요 — 헤어질 때 자주 나오는 말이에요.',
    explanation:
      '호감과 친근함의 표현이지만, 날짜를 정하지 않으면 실제 계획이 아닌 경우가 많아요. 진짜 만나고 싶으면 먼저 구체적인 날을 제안하세요.',
  },
]

export type QuizCategory =
  | 'errands'
  | 'doctor'
  | 'work'
  | 'smalltalk'
  | 'school'
  | 'rent'

export interface QuizQuestion {
  situation: string
  phrase: string
  choices: string[]
  answer: number
  hint: string
  explanation: string
  category: QuizCategory
}

export const quizQuestions: QuizQuestion[] = [
  // ── 기존 8문제 (category 추가 + 정답 위치 섞음) ──
  {
    situation: 'The cashier says',
    phrase: 'You all set?',
    choices: ['Are you feeling okay?', 'Is it sold out?', 'Are you ready to check out?'],
    answer: 2,
    hint: '다시 생각해보세요 — 계산대에서 자주 쓰는 표현이에요.',
    explanation:
      '"You all set?"은 "준비 다 되셨어요? / 계산할까요?"라는 뜻이에요. 몸 상태를 묻는 게 아닙니다.',
    category: 'errands',
  },
  {
    situation: 'A coworker says',
    phrase: 'We should grab coffee sometime!',
    choices: [
      '그냥 친근하게 던지는 인사치레일 때가 많음',
      '지금 커피 마시러 가자는 뜻',
      '커피 사다 달라는 부탁',
    ],
    answer: 0,
    hint: '다시 생각해보세요 — 구체적인 날짜나 시간이 있었나요?',
    explanation:
      '구체적인 제안(날짜·시간)이 없으면 진짜 약속이 아니라 친근함을 표현하는 인사치레일 때가 많아요. 진짜 만나고 싶으면 상대가 "How about Friday?"처럼 날짜를 말합니다.',
    category: 'smalltalk',
  },
  {
    situation: 'Your manager replies',
    phrase: "I'll look into it.",
    choices: [
      '바로 처리하겠다는 뜻',
      '확답은 아니고, 검토해보겠다는 뜻',
      '네가 알아서 하라는 뜻',
    ],
    answer: 1,
    hint: '다시 생각해보세요 — 확실한 약속처럼 들리나요, 여지를 남기는 말인가요?',
    explanation:
      '"알아볼게요"라는 뜻인데, 확답이 아니라 시간을 벌거나 완곡하게 미루는 표현일 때도 많아요. 급하면 "When can I expect an update?"로 물어보세요.',
    category: 'work',
  },
  {
    situation: 'The barista asks',
    phrase: 'Room for cream?',
    choices: [
      '우유·크림 넣을 공간을 남겨둘까라는 뜻',
      '크림 추가 요금을 낼 거냐는 뜻',
      '앉을 자리가 있냐는 뜻',
    ],
    answer: 0,
    hint: '다시 생각해보세요 — 커피를 따르는 상황이에요.',
    explanation:
      '커피잔에 우유나 크림을 넣을 공간을 남겨둘지 묻는 말이에요. "Yes, please." 또는 "No, fill it up."이라고 답하면 됩니다.',
    category: 'errands',
  },
  {
    situation: 'A colleague messages you',
    phrase: 'No worries if not, but could you send that over?',
    choices: [
      '안 보내도 전혀 상관없다는 뜻',
      '이미 받았으니 보내지 말라는 뜻',
      '부드럽게 말했지만 사실 보내주길 바라는 부탁',
    ],
    answer: 2,
    hint: '다시 생각해보세요 — 왜 부탁 내용을 뒤에 붙였을까요?',
    explanation:
      '"안 되면 괜찮아"라고 부드럽게 포장했지만, 실제로는 보내주길 바라는 정중한 부탁이에요. 영어권에선 부담을 줄이려고 이렇게 완곡하게 말합니다.',
    category: 'work',
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
    category: 'smalltalk',
  },
  {
    situation: 'In a meeting, someone says',
    phrase: "That's an interesting idea.",
    choices: [
      '당신 아이디어가 훌륭하다는 칭찬',
      '더 자세히 설명해달라는 요청',
      '별로라고 생각하지만 예의상 하는 말일 수 있음',
    ],
    answer: 2,
    hint: '다시 생각해보세요 — 항상 칭찬일까요? 톤에 따라 다를 수 있어요.',
    explanation:
      '진짜 흥미롭다는 뜻일 수도 있지만, 회의에서는 완곡하게 반대하거나 유보할 때 자주 쓰는 표현이에요. 뒤에 "but..."이 따라오면 특히 그렇습니다.',
    category: 'work',
  },
  {
    situation: 'Someone you just met says',
    phrase: 'We should hang out!',
    choices: [
      '호감의 표현이지만 실제 계획은 아닐 때가 많음',
      '구체적으로 약속을 잡자는 뜻',
      '지금 같이 가자는 뜻',
    ],
    answer: 0,
    hint: '다시 생각해보세요 — 헤어질 때 자주 나오는 말이에요.',
    explanation:
      '호감과 친근함의 표현이지만, 날짜를 정하지 않으면 실제 계획이 아닌 경우가 많아요. 진짜 만나고 싶으면 먼저 구체적인 날을 제안하세요.',
    category: 'smalltalk',
  },

  // ── 신규: DOCTOR / ADMIN (병원·관공서) ──
  {
    situation: '병원 접수 데스크에서',
    phrase: 'Have you been seen here before?',
    choices: [
      '저희가 전에 뵌 적이 있나요?',
      '전에 여기서 누구를 만나셨나요?',
      '전에 저희 병원에서 진료받으신 적 있으세요?',
    ],
    answer: 2,
    hint: "다시 생각해보세요 — 'seen'은 '보이다' 말고, 의료진이 환자를 대할 때 쓰는 다른 뜻이 있어요.",
    explanation:
      "'be seen'은 병원에서 '진료를 받다'라는 관용 표현입니다. 단순히 건물에 와봤는지가 아니라, 진료 기록이 있는 기존 환자인지를 묻는 거예요. 처음이면 \"No, this is my first time.\"이라고 답하면 됩니다.",
    category: 'doctor',
  },
  {
    situation: '의사가 검사 결과를 보며',
    phrase: "Let's keep an eye on it.",
    choices: [
      '지금 바로 치료를 시작합시다.',
      '당장 치료하지 않고 경과를 지켜봅시다.',
      '그 부분은 신경 쓰지 않아도 됩니다.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 지금 무언가를 '하겠다'는 말일까요, '하지 않겠다'는 말일까요?",
    explanation:
      '지금은 개입하지 않고 관찰하겠다는 뜻입니다. 심각하진 않지만 무시하지도 않겠다는 중간 지점이에요. 불안하면 "What should I watch for?"라고 물어보세요.',
    category: 'doctor',
  },
  {
    situation: '보험 문제로 접수처와 통화 중',
    phrase: "We'll get that squared away.",
    choices: [
      '저희가 그 문제를 처리해드릴게요.',
      '그건 저희 담당이 아닙니다.',
      '서류를 반듯하게 정리해주세요.',
    ],
    answer: 0,
    hint: "다시 생각해보세요 — 'square away'는 도형과 아무 상관 없는 관용구예요.",
    explanation:
      '"정리해서 해결하겠다"는 뜻의 일상 관용구입니다. 안심시키는 톤이에요. 다만 언제까지인지는 말하지 않았으니, "Any idea how long that usually takes?"로 시점을 확인하는 게 좋습니다.',
    category: 'doctor',
  },
  {
    situation: '약국에서 처방전을 냈더니',
    phrase: "It'll be ready in about 20.",
    choices: [
      '20달러가 나왔습니다.',
      '20일 뒤에 다시 오세요.',
      '20분쯤 뒤에 준비됩니다.',
    ],
    answer: 2,
    hint: '다시 생각해보세요 — 숫자 뒤의 단위를 통째로 생략했어요. 약국에서 가장 자연스러운 건 어느 쪽일까요?',
    explanation:
      '"in about 20 minutes"에서 minutes를 생략한 구어체입니다. 미국 일상에서 시간 단위는 이렇게 자주 생략돼요. 기다릴 거면 "I\'ll wait.", 나중에 올 거면 "I\'ll come back."',
    category: 'doctor',
  },
  {
    situation: '관공서 창구 직원이',
    phrase: "You'll want to bring that to window 3.",
    choices: [
      '3번 창구로 가져가셔야 합니다.',
      '3번 창구를 원하시는 게 맞나요?',
      '3번 창구가 마음에 드실 겁니다.',
    ],
    answer: 0,
    hint: "다시 생각해보세요 — 'You'll want to'가 정말 상대의 '바람'을 묻고 있을까요?",
    explanation:
      '"You\'ll want to ~"는 미국에서 지시를 완곡하게 만드는 흔한 방식입니다. 사실상 "You need to go to window 3."예요. 선택지가 아니라 지시입니다.',
    category: 'doctor',
  },

  // ── 신규: RENT / NEIGHBOR (렌트·이웃) ──
  {
    situation: '집주인에게 수리를 요청했더니',
    phrase: "I'll get someone out there.",
    choices: [
      '누군가를 밖으로 내보내겠습니다.',
      '수리할 사람을 보내드리겠습니다.',
      '직접 오셔서 해결하셔야 합니다.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 'someone'은 누구를 가리킬까요? 'out there'는 어디일까요?",
    explanation:
      '수리공을 보내겠다는 뜻입니다. 핵심은 언제인지를 전혀 말하지 않았다는 거예요. 이 말만 믿고 기다리면 몇 주가 갈 수 있습니다. "Do you know roughly when?"이라고 반드시 되물으세요.',
    category: 'rent',
  },
  {
    situation: '옆집 이웃이 문 앞에서',
    phrase: 'Not to be that guy, but...',
    choices: [
      '제가 그 남자는 아니지만,',
      '저 사람 얘기를 하려는 건 아니지만,',
      '까다롭게 굴고 싶진 않지만,',
    ],
    answer: 2,
    hint: "다시 생각해보세요 — 'that guy'는 특정 인물이 아니라 어떤 '유형'의 사람을 가리켜요.",
    explanation:
      "'that guy'는 사사건건 트집 잡는 진상을 뜻합니다. 즉 '까탈스럽게 굴고 싶진 않은데'라는 완충 표현이고, 바로 뒤에 반드시 불평이 옵니다. 이 말이 들리면 마음의 준비를 하세요. 보통은 소음이나 주차 문제예요.",
    category: 'rent',
  },
  {
    situation: '이사 나갈 때 집주인이 벽을 보며',
    phrase: "That's just wear and tear.",
    choices: [
      '그건 그냥 자연스러운 사용 흔적입니다.',
      '그건 당신이 찢어놓은 자국입니다.',
      '그건 옷이 해져서 생긴 겁니다.',
    ],
    answer: 0,
    hint: '다시 생각해보세요 — 집주인이 지금 돈을 요구하고 있나요, 괜찮다고 하고 있나요?',
    explanation:
      "'wear and tear'는 정상적인 생활로 생긴 마모를 뜻하는 계약 용어입니다. 세입자 책임이 아니라는 뜻이라 보증금에서 공제되지 않아요. 좋은 신호입니다.",
    category: 'rent',
  },
  {
    situation: '이웃이 지나가며',
    phrase: "We're having a few people over Saturday.",
    choices: [
      '토요일에 저희 집으로 초대하고 싶어요.',
      '토요일에 저희 집에 손님이 옵니다.',
      '토요일에 도와줄 사람이 몇 명 필요해요.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 'have people over'가 벌어지는 장소는 어디이고, 당신은 거기 포함될까요?",
    explanation:
      "'have people over'는 '우리 집에 손님을 부르다'입니다. 초대가 아니라 소음 예고이자 사전 양해예요. 여기서 당신을 부른 게 아닙니다. \"Thanks for the heads up!\"이라고 답하면 딱 맞습니다.",
    category: 'rent',
  },
  {
    situation: '관리사무소에 고장 신고를 했더니',
    phrase: "I'll put in a work order.",
    choices: [
      '지금 바로 고치러 가겠습니다.',
      '작업 순서를 직접 정해주시기 바랍니다.',
      '수리 요청을 시스템에 접수하겠습니다.',
    ],
    answer: 2,
    hint: "다시 생각해보세요 — '접수'와 '수리'는 같은 일일까요?",
    explanation:
      "'work order'는 수리 요청 티켓입니다. 시스템에 등록만 하겠다는 뜻이고, 실제 수리 일정은 아직 아무것도 정해지지 않았어요. \"Can I get the work order number?\"로 번호를 받아두면 나중에 추적할 수 있습니다.",
    category: 'rent',
  },

  // ── 신규: SCHOOL (학교) ──
  {
    situation: '교수님이 수업을 마치며',
    phrase: 'Feel free to come to office hours.',
    choices: [
      '지금은 바쁘니 나중에 다시 오세요.',
      '언제든 상담 시간에 찾아오세요.',
      '상담 시간은 자유롭게 바꾸셔도 됩니다.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 미국 대학에서 'office hours'는 교수가 무엇을 위해 비워둔 시간일까요?",
    explanation:
      '이건 빈말이 아닙니다. Office hours는 학생 상담을 위해 존재하는 시간이고, 안 오는 학생이 훨씬 많아서 오면 오히려 반가워해요. 한국식으로 "폐를 끼치는 것"이 아닙니다. 실제로 가세요.',
    category: 'school',
  },
  {
    situation: '수업이 끝나갈 무렵 교수님이 나에게',
    phrase: 'See me after class.',
    choices: [
      '수업 끝나고 저를 좀 도와주세요.',
      '수업 후에 저에게 따로 오세요.',
      '수업 중에는 저를 보고 계세요.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 'see'는 눈으로 보는 행위가 아니라, 누군가를 '찾아가 만나다'라는 뜻일 수 있어요.",
    explanation:
      '따로 할 이야기가 있다는 뜻입니다. 성적이나 출결 문제일 수도, 연구 제안 같은 좋은 이야기일 수도 있어요. 톤만으로는 알 수 없으니 겁먹지 말고 가면 됩니다.',
    category: 'school',
  },
  {
    situation: '조교가 내 과제를 보며',
    phrase: "You're on the right track, but...",
    choices: [
      '거의 다 맞았고 조금만 손보면 됩니다.',
      '아주 잘했으니 그대로 제출하세요.',
      '방향은 맞지만 중요한 문제가 있습니다.',
    ],
    answer: 2,
    hint: "다시 생각해보세요 — 'but' 앞의 칭찬과 뒤의 내용 중, 진짜 하고 싶은 말은 어느 쪽일까요?",
    explanation:
      '앞의 칭찬은 충격을 줄이기 위한 완충재이고, 진짜 내용은 "but" 다음에 옵니다. 미국식 피드백의 전형적인 구조예요. 앞부분에 안심하지 말고 "but" 뒤를 집중해서 들으세요.',
    category: 'school',
  },
  {
    situation: '같은 수업 친구가 노트를 빌리며',
    phrase: "I'll owe you one.",
    choices: [
      '너한테 1달러를 빚졌어.',
      '이번엔 내가 신세를 졌네.',
      '하나만 더 빌려주면 안 될까.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 'one'은 물건이 아니에요. 눈에 보이지 않는 무언가를 세고 있어요.",
    explanation:
      '"a favor"(호의, 신세)를 생략한 표현입니다. 실제 채무가 아니라 사교적인 감사 표현이에요. "No worries!"나 "Anytime." 정도로 가볍게 받으면 됩니다.',
    category: 'school',
  },

  // ── 신규: ERRANDS (일상 심부름) ──
  {
    situation: '식당에서 종업원이 내 접시를 보며',
    phrase: 'Are you still working on that?',
    choices: [
      '그 일은 아직 하고 계신가요?',
      '더 주문하실 게 있으신가요?',
      '아직 드시는 중이신가요?',
    ],
    answer: 2,
    hint: "다시 생각해보세요 — 'that'이 가리키는 건 일이 아니라, 지금 눈앞에 놓인 무언가예요.",
    explanation:
      '겉으로는 식사 여부를 묻지만, 속뜻은 "접시를 치워도 되냐"입니다. 다 먹었으면 "I\'m done, thank you.", 더 먹을 거면 "Still working on it, thanks."',
    category: 'errands',
  },
  {
    situation: '매장 직원이 다가와서',
    phrase: 'Can I help you find something?',
    choices: [
      '뭔가 찾으시는 걸 도와드릴까요?',
      '물건을 잃어버리셨나요?',
      '저를 좀 도와주실 수 있나요?',
    ],
    answer: 0,
    hint: "다시 생각해보세요 — 'help you find'에서 찾는 사람은 누구이고, 돕는 사람은 누구일까요?",
    explanation:
      '미국 매장의 표준 인사입니다. 사야 한다는 압박이 아니에요. 그냥 구경 중이면 "I\'m just looking, thanks."라고 하면 직원이 바로 물러납니다. 무례한 답이 아니라 가장 자연스러운 답이에요.',
    category: 'errands',
  },
  {
    situation: '가게에서 쇼핑 중인데 직원이',
    phrase: "We're closing in ten.",
    choices: [
      '10분 뒤에 문을 닫습니다.',
      '10일 동안 휴업할 예정입니다.',
      '10시에 문을 열 예정입니다.',
    ],
    answer: 0,
    hint: '다시 생각해보세요 — 이건 단순한 정보 전달일까요, 부드럽게 감싼 부탁일까요?',
    explanation:
      '"in ten minutes"의 생략형입니다. 그리고 사실상 "이제 계산대로 가주세요"라는 완곡한 요청이에요. 정보만 주는 게 아닙니다. "Okay, I\'ll head to the register." 하고 마무리하면 됩니다.',
    category: 'errands',
  },
  {
    situation: '집에 왔더니 문에 붙어 있는 택배 쪽지',
    phrase: 'Sorry we missed you.',
    choices: [
      '당신이 그리웠습니다.',
      '부재중이라 전달하지 못했습니다.',
      '주소를 잘못 찾아왔습니다.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 'miss'에는 '그리워하다' 말고 '엇갈리다'라는 뜻도 있어요.",
    explanation:
      '"만나지 못했다"는 뜻으로, 배송 실패 안내입니다. 보통 쪽지 뒷면이나 하단에 재배달 신청 방법과 픽업 장소가 적혀 있으니 꼭 확인하세요.',
    category: 'errands',
  },

  // ── 신규: WORK (직장·회의) ──
  {
    situation: '회의 중 내가 세부 사항을 파고들자 팀장이',
    phrase: "Let's take this offline.",
    choices: [
      '인터넷을 끄고 이야기합시다.',
      '이 주제는 없던 걸로 합시다.',
      '이 얘기는 회의 끝나고 따로 합시다.',
    ],
    answer: 2,
    hint: "다시 생각해보세요 — 'offline'은 인터넷 연결과 아무 상관 없는 비즈니스 관용구예요.",
    explanation:
      '"지금 이 자리 말고 따로 이야기하자"는 뜻입니다. 화가 난 게 아니라, 다른 참석자들에게는 관련 없는 주제라 시간을 아끼려는 거예요. 무시당한 게 아니니 회의 후 실제로 팔로업하면 됩니다.',
    category: 'work',
  },
  {
    situation: '내 제안에 동료가',
    phrase: "I'd push back on that a little.",
    choices: [
      '그 의견에는 조금 반대합니다.',
      '그 의견을 더 밀어붙여 보세요.',
      '조금만 뒤로 물러나 주세요.',
    ],
    answer: 0,
    hint: "다시 생각해보세요 — 'push back'의 방향을 보세요. 밀어주는 걸까요, 되미는 걸까요?",
    explanation:
      "'push back'은 반대나 이의 제기입니다. 'a little'을 붙여 부드럽게 만들었지만 본질은 반박이에요. 감정적인 공격이 아니니 방어하지 말고 \"That's fair — what's your concern?\"처럼 받으세요.",
    category: 'work',
  },
  {
    situation: '이메일 답장 첫 줄에',
    phrase: 'Per my last email,',
    choices: [
      '지난 이메일에서 이미 말씀드렸듯이,',
      '지난 이메일을 다시 보내드리자면,',
      '새로운 소식을 알려드리자면,',
    ],
    answer: 0,
    hint: "다시 생각해보세요 — 겉으로는 정중합니다. 그런데 왜 굳이 '지난 이메일'을 끄집어냈을까요?",
    explanation:
      '형식은 정중하지만 실제로는 "이미 답했잖아요"라는 짜증의 신호입니다. 미국 직장에서 유명한 수동공격적 표현이에요. 이 말을 들었다면 놓친 게 있는지 확인하고, 본인이 쓸 때는 웬만하면 피하세요.',
    category: 'work',
  },

  // ── 신규: SMALLTALK (스몰토크) ──
  {
    situation: '대화가 길어지자 상대가',
    phrase: "Well, I'll let you go.",
    choices: [
      '이제 그만 붙잡고 보내드릴게요.',
      '이제 대화를 마무리하는 게 좋겠어요.',
      '먼저 가셔도 괜찮습니다.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 형식은 '당신'을 배려하는 말입니다. 그런데 실제로 자리를 뜨고 싶은 사람은 누구일까요?",
    explanation:
      '"바쁘실 텐데 붙잡지 않을게요"라는 형식이지만, 실제로는 말하는 사람이 대화를 끝내고 싶다는 신호입니다. 정중한 마무리 신호예요. 기분 나빠할 일이 아니고, "Good to see you! Take care."로 받으면 됩니다.',
    category: 'smalltalk',
  },
  {
    situation: '실수로 부딪혀서 사과했더니 상대가',
    phrase: "You're good.",
    choices: [
      '당신은 참 좋은 사람이네요.',
      '아주 잘 피하셨네요.',
      '괜찮습니다, 신경 쓰지 마세요.',
    ],
    answer: 2,
    hint: "다시 생각해보세요 — 여기서 'good'은 사람에 대한 평가가 아니라, 상황에 대한 판단이에요.",
    explanation:
      '"No problem"과 같은 뜻의 캐주얼한 미국식 표현입니다. "You\'re fine.", "You\'re all good."도 똑같이 씁니다. 칭찬이 아니라 "문제없다"는 면제예요.',
    category: 'smalltalk',
  },
  {
    situation: '약속을 잡으려 하자 상대가',
    phrase: "Let's play it by ear.",
    choices: [
      '미리 정하지 말고 그때 가서 정합시다.',
      '음악을 들으면서 이야기합시다.',
      '각자 알아서 하기로 합시다.',
    ],
    answer: 0,
    hint: '다시 생각해보세요 — 악보 없이 연주하는 상황을 떠올려보세요. 무엇을 미리 정하지 않은 걸까요?',
    explanation:
      '악보 없이 귀로 듣고 즉흥 연주하는 데서 온 관용구로, "미리 계획하지 말고 상황 봐서 하자"는 뜻입니다. 확정된 약속이 아니라는 게 핵심이에요. 기대하고 기다리면 안 됩니다.',
    category: 'smalltalk',
  },
  // SoundNative — 추가 문제 4개
// doctor 1개 / school 2개 / rent 1개
//
// 목적: 각 카테고리를 3의 배수로 맞춰 세션에서 버려지는 문제를 없앰
//   doctor 5 → 6 (2세션)
//   school 4 → 6 (2세션)
//   rent   5 → 6 (2세션)
//   총 32 → 36문제, 9세션 → 12세션
//
// 사용법: quizData.ts의 배열 맨 끝(닫는 ] 앞)에 붙여넣기

  // ── 추가: DOCTOR ──
  {
    situation: '진료비 안내를 받는데 직원이',
    phrase: "That's going to be out of pocket.",
    choices: [
      '보험사에서 직접 청구할 예정입니다.',
      '보험이 적용되지 않아 전액 본인 부담입니다.',
      '나중에 환급받으실 수 있습니다.',
    ],
    answer: 1,
    hint: "다시 생각해보세요 — 'pocket'이 나왔지만 실제 주머니 이야기가 아니에요. 누구의 돈일까요?",
    explanation:
      "'out of pocket'은 보험이 커버하지 않아 내 돈으로 직접 내야 한다는 뜻입니다. 미국 병원에서 가장 중요한 표현 중 하나예요. 이 말이 나오면 \"How much will that be?\"로 금액을 먼저 확인하세요.",
    category: 'doctor',
  },

  // ── 추가: SCHOOL ──
  {
    situation: '수업 중 질문했더니 교수님이',
    phrase: "That's a good question.",
    choices: [
      '정말 훌륭한 질문이라는 칭찬입니다.',
      '수업과 관련 없는 질문이라는 뜻입니다.',
      '답을 고를 시간을 버는 말이기도 합니다.',
    ],
    answer: 2,
    hint: '다시 생각해보세요 — 이 말 다음에 바로 명쾌한 답이 나오던가요?',
    explanation:
      '진짜 칭찬일 때도 있지만, 답을 모르거나 어떻게 설명할지 고민할 때 시간을 버는 완충 표현으로도 자주 씁니다. 뒤에 "Let me think about that."이나 "I\'ll get back to you."가 따라오면 후자예요.',
    category: 'school',
  },
  {
    situation: '조별과제 회의에서 팀원이',
    phrase: "I'll take a stab at it.",
    choices: [
      '내가 한번 시도해볼게.',
      '나는 그 부분을 맡지 않을게.',
      '내가 검토만 해줄게.',
    ],
    answer: 0,
    hint: '다시 생각해보세요 — 이 사람은 일을 맡겠다는 걸까요, 빠지겠다는 걸까요?',
    explanation:
      "'take a stab at'은 '한번 해보다'라는 뜻의 관용구입니다. 완벽하진 않아도 초안을 만들어보겠다는 뉘앙스예요. 맡겠다는 뜻이니 \"That'd be great, thanks!\"로 받으면 됩니다.",
    category: 'school',
  },

  // ── 추가: RENT ──
  {
    situation: '집을 보러 갔더니 부동산 중개인이',
    phrase: "It's got good bones.",
    choices: [
      '최근에 전부 새로 고쳤다는 뜻입니다.',
      '인테리어가 고급스럽다는 뜻입니다.',
      '낡았지만 구조는 튼튼하다는 뜻입니다.',
    ],
    answer: 2,
    hint: "다시 생각해보세요 — 집을 칭찬하는 말입니다. 그런데 왜 하필 '뼈대'만 칭찬했을까요?",
    explanation:
      '기본 골격과 구조는 좋다는 칭찬이지만, 뒤집으면 마감·설비·인테리어는 손볼 데가 많다는 뜻입니다. 부동산 광고에서 아주 흔한 완곡어법이에요. 이 말이 나오면 수리 상태를 특히 꼼꼼히 확인하세요.',
    category: 'rent',
  },
]
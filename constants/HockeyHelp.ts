export interface HockeyQA {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const SuggestedQuestions = [
  "What are the basic rules of hockey?",
  "How long is a hockey match?",
  "What equipment do I need to play hockey?",
  "How does the scoring work in hockey?",
  "What are the different positions in hockey?",
  "Are there any local hockey clubs in Namibia?",
  "What's the difference between field hockey and ice hockey?",
  "How can I improve my hockey skills?"
];

export const HockeyAnswers: HockeyQA[] = [
  {
    id: "1",
    question: "What are the basic rules of hockey?",
    answer: "The basic rules of hockey include: two teams of 11 players each, players can only hit the ball with the flat side of their stick, the ball can only be touched with the stick (except for goalkeepers), goals are scored by hitting the ball into the opponent's net, and players cannot use their feet or body to block the ball deliberately.",
    category: "Rules"
  },
  {
    id: "2",
    question: "How long is a hockey match?",
    answer: "A standard hockey match consists of four quarters, each lasting 15 minutes with a 2-minute break between quarters and a 10-minute halftime break. Total playing time is 60 minutes.",
    category: "Rules"
  },
  {
    id: "3",
    question: "What equipment do I need to play hockey?",
    answer: "Essential hockey equipment includes: a hockey stick, mouthguard, shin guards, appropriate footwear (cleats or turf shoes), and a hockey ball. Goalkeepers need additional protective gear including helmet, chest protector, leg pads, kickers, and hand protectors.",
    category: "Equipment"
  },
  {
    id: "4",
    question: "How does the scoring work in hockey?",
    answer: "In hockey, a team scores one point when they successfully hit the ball into the opponent's goal from within the shooting circle. Goals can be scored from field play or from penalty corners and penalty strokes. The team with the most goals at the end of the match wins.",
    category: "Rules"
  },
  {
    id: "5",
    question: "What are the different positions in hockey?",
    answer: "Hockey positions include: Goalkeeper (defends the goal), Defenders/Backs (focus on defense), Midfielders (link defense and attack), and Forwards/Strikers (focus on scoring goals). Teams typically have formations like 4-3-3 or 4-4-2 to organize these positions.",
    category: "Positions"
  },
  {
    id: "6",
    question: "Are there any local hockey clubs in Namibia?",
    answer: "Yes, Namibia has several hockey clubs including Windhoek Hockey Club, Coastal Hockey Club in Swakopmund, University of Namibia Hockey Club, and the Namibian Defence Force Hockey Club. Many schools also have hockey teams and programs.",
    category: "Local"
  },
  {
    id: "7",
    question: "What's the difference between field hockey and ice hockey?",
    answer: "Field hockey is played on grass or artificial turf with a small, hard ball and a stick with a curved end. Ice hockey is played on ice with a puck and a straight stick with a blade. Field hockey has 11 players per side while ice hockey has 6. Field hockey is more common in countries like Namibia, India, and Australia, while ice hockey is popular in colder regions like Canada and northern Europe.",
    category: "General"
  },
  {
    id: "8",
    question: "How can I improve my hockey skills?",
    answer: "To improve your hockey skills: 1) Practice regularly focusing on stick handling and ball control, 2) Work on fitness and agility, 3) Join a local club for structured training, 4) Watch professional matches to understand tactics, 5) Focus on both technical skills (passing, shooting) and game awareness, and 6) Consider attending hockey camps or clinics when available.",
    category: "Training"
  },
  {
    id: "9",
    question: "What are penalty corners in hockey?",
    answer: "Penalty corners are awarded when a defending team commits a foul within their shooting circle or intentionally hits the ball over the backline. The attacking team takes the corner from a spot on the backline. The ball must be stopped outside the circle before a shot can be taken. Defenders start from the goal line and can only move once the ball is played.",
    category: "Rules"
  },
  {
    id: "10",
    question: "When is the hockey season in Namibia?",
    answer: "The hockey season in Namibia typically runs from March through September, avoiding the hottest summer months. The National Hockey League usually starts in April, with various tournaments and championships held throughout the season. School hockey typically follows a similar calendar.",
    category: "Local"
  },
  {
    id: "11",
    question: "What are the major hockey tournaments in Namibia?",
    answer: "Major hockey tournaments in Namibia include the National Hockey League, the Bank Windhoek Field Hockey League, various school tournaments like the Inter-Schools Hockey Tournament, and occasional international fixtures when Namibia's national team plays against other countries.",
    category: "Local"
  },
  {
    id: "12",
    question: "How do I register for a hockey team?",
    answer: "To register for a hockey team in Namibia, contact your local hockey club directly or reach out to the Namibia Hockey Union. For school teams, speak with your school's sports department. Most clubs welcome new players and often have programs for beginners. Registration typically happens before the season starts in March/April.",
    category: "Local"
  }
];

export function findHockeyAnswer(query: string): HockeyQA | null {
  // Convert to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase();
  
  // First try exact matching with questions
  const exactMatch = HockeyAnswers.find(qa => 
    qa.question.toLowerCase() === lowerQuery
  );
  
  if (exactMatch) return exactMatch;
  
  // Then try to find a question that contains the query keywords
  const keywordMatch = HockeyAnswers.find(qa => {
    const questionWords = qa.question.toLowerCase().split(' ');
    const queryWords = lowerQuery.split(' ').filter(word => word.length > 3); // Filter out short words
    
    return queryWords.some(word => questionWords.includes(word));
  });
  
  if (keywordMatch) return keywordMatch;
  
  // Try to match based on category
  const categoryMatch = HockeyAnswers.find(qa => 
    qa.category?.toLowerCase() === lowerQuery || 
    lowerQuery.includes(qa.category?.toLowerCase() || '')
  );
  
  return categoryMatch || null;
} 
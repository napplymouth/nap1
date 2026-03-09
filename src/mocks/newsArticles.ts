export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  body: string[];
  date: string;
  datePublished: string;
  author: string;
  authorPhoto: string;
  category: 'Milestone' | 'Partnership' | 'Programme' | 'Events' | 'Story';
  image: string;
  featured?: boolean;
  readTime?: string;
}

export const categoryColors: Record<string, string> = {
  Milestone: 'bg-pink-500 text-white',
  Partnership: 'bg-teal-500 text-white',
  Programme: 'bg-lime-400 text-gray-900',
  Events: 'bg-yellow-400 text-gray-900',
  Story: 'bg-orange-400 text-white',
};

export const categoryIcons: Record<string, string> = {
  All: 'ri-grid-fill',
  Milestone: 'ri-trophy-fill',
  Partnership: 'ri-handshake-fill',
  Programme: 'ri-book-open-fill',
  Events: 'ri-calendar-event-fill',
  Story: 'ri-heart-fill',
};

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Plymouth Council Partners with Naloxone Advocates for City-Wide Training',
    excerpt: 'A new partnership will see naloxone training offered at all community centres across Plymouth, making life-saving skills more accessible than ever before.',
    body: [
      'Plymouth City Council has announced a groundbreaking partnership with Naloxone Advocates Plymouth CIC that will bring naloxone training to every community centre across the city. The initiative, launching in February 2025, represents the most comprehensive harm reduction programme Plymouth has ever seen.',
      'Under the new agreement, council-run community centres in Devonport, Stonehouse, Plympton, Plymstock, and the city centre will host monthly naloxone training sessions delivered by our certified peer trainers. The council has committed funding for training materials, naloxone kits, and venue support for the next two years.',
      'Councillor Sarah Mitchell, Cabinet Member for Health and Adult Social Care, said the partnership reflects the council\'s commitment to evidence-based harm reduction. "Naloxone saves lives. It\'s that simple," she told reporters at the announcement event. "By making training accessible in every neighbourhood, we\'re empowering our communities to respond to the overdose crisis with compassion and practical action."',
      'The partnership also includes a dedicated outreach programme targeting areas with higher rates of drug-related harm. Our mobile training van will visit housing estates, supported accommodation facilities, and community events throughout the year, ensuring no one is left behind.',
      'Marcus Thompson, our Lead Peer Trainer, expressed his excitement about the expanded reach. "For years we\'ve been doing this work on shoestring budgets and volunteer hours. This partnership means we can finally reach the people who need us most. It\'s a game-changer for Plymouth."'
    ],
    date: '28 Jan 2025',
    datePublished: '2025-01-28',
    author: 'Emma Richardson',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20confident%20British%20woman%20in%20her%20late%2030s%20with%20warm%20smile%2C%20short%20brown%20hair%2C%20wearing%20a%20teal%20blouse%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-emma&orientation=squarish',
    category: 'Partnership',
    image: 'https://readdy.ai/api/search-image?query=community%20partnership%20meeting%20in%20modern%20council%20building%2C%20diverse%20group%20of%20professionals%20and%20community%20workers%20shaking%20hands%2C%20bright%20natural%20lighting%2C%20official%20setting%20with%20warm%20atmosphere%2C%20documentary%20photography%20style&width=800&height=500&seq=news1&orientation=landscape',
    featured: true,
    readTime: '3 min read'
  },
  {
    id: '2',
    title: '150 Lives Saved: Celebrating Our Community Impact',
    excerpt: 'We are proud to announce that naloxone distributed through our programme has now been used to reverse over 150 overdoses in Plymouth and Devon.',
    body: [
      'Today we celebrate a milestone that represents 150 people who are still here, still breathing, still with their families and communities. Since our founding in March 2022, naloxone kits distributed through Naloxone Advocates Plymouth have been used to reverse over 150 opioid overdoses across Plymouth and Devon.',
      'These aren\'t just statistics. Each number represents a life saved, a family spared unimaginable grief, and a community member given another chance. Behind every reversal is someone who attended our training, carried a kit, and had the courage to act when it mattered most.',
      'The 150th recorded reversal happened on January 18th in Stonehouse, when a trained community member used their naloxone kit to revive a neighbour who had collapsed in a shared hallway. Paramedics arrived to find the person conscious and breathing, thanks to the rapid administration of naloxone.',
      'Dr. James Chen, Emergency Medicine Consultant at Derriford Hospital, praised the programme\'s impact. "We see the results of community naloxone distribution every week in our emergency department. People are arriving conscious instead of in cardiac arrest. That\'s the difference between life and death, and it\'s down to programmes like this."',
      'While we celebrate this milestone, we also acknowledge the ongoing crisis that makes this work necessary. Drug-related deaths remain unacceptably high across the UK, and Plymouth is no exception. Every life saved is a victory, but our work continues until naloxone is as common as a first aid kit in every home, workplace, and community space.'
    ],
    date: '20 Jan 2025',
    datePublished: '2025-01-20',
    author: 'Marcus Thompson',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20friendly%20Black%20British%20man%20in%20his%20early%2040s%20with%20a%20warm%20genuine%20smile%2C%20short%20hair%2C%20wearing%20a%20dark%20navy%20shirt%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-marcus&orientation=squarish',
    category: 'Milestone',
    image: 'https://readdy.ai/api/search-image?query=celebration%20event%20with%20community%20health%20workers%2C%20people%20holding%20certificates%20and%20smiling%2C%20colorful%20balloons%20and%20banners%2C%20warm%20supportive%20atmosphere%2C%20bright%20indoor%20lighting%2C%20documentary%20photography&width=600&height=400&seq=news2&orientation=landscape',
    readTime: '4 min read'
  },
  {
    id: '3',
    title: 'New Peer Trainer Programme Launches This Spring',
    excerpt: 'Applications are now open for our expanded Peer Trainer programme. Share your lived experience and help save lives in your community.',
    body: [
      'We are thrilled to announce the launch of our expanded Peer Trainer Programme, with applications now open for the Spring 2025 cohort. This intensive 8-week programme trains individuals with lived experience of drug use, recovery, or affected family members to become certified naloxone trainers in their communities.',
      'The programme combines practical training skills with harm reduction theory, trauma-informed practice, and community engagement strategies. Participants will learn how to deliver engaging naloxone training sessions, support people in crisis, and advocate for evidence-based drug policy in their neighbourhoods.',
      'What makes our peer trainer model unique is its foundation in lived experience. Our trainers aren\'t distant professionals—they\'re community members who understand the realities of drug use, stigma, and survival. This authenticity creates trust and connection that traditional medical training often lacks.',
      'The Spring cohort will run from March through April 2025, with sessions held twice weekly at our Devonport training centre. Successful graduates will receive a nationally recognised certification, ongoing mentorship, and opportunities to deliver paid training sessions across Plymouth and Devon.',
      'Applications are open to anyone over 18 with a connection to drug use—whether through personal experience, family impact, or community involvement. No formal qualifications are required, just a commitment to harm reduction and a desire to make a difference. The application deadline is February 15th, and spaces are limited to ensure quality training and support.'
    ],
    date: '15 Jan 2025',
    datePublished: '2025-01-15',
    author: 'Emma Richardson',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20confident%20British%20woman%20in%20her%20late%2030s%20with%20warm%20smile%2C%20short%20brown%20hair%2C%20wearing%20a%20teal%20blouse%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-emma&orientation=squarish',
    category: 'Programme',
    image: 'https://readdy.ai/api/search-image?query=training%20workshop%20with%20diverse%20participants%20learning%20together%2C%20instructor%20demonstrating%20to%20engaged%20audience%2C%20bright%20modern%20classroom%20setting%2C%20supportive%20educational%20environment%2C%20natural%20lighting&width=600&height=400&seq=news3&orientation=landscape',
    readTime: '2 min read'
  },
  {
    id: '4',
    title: 'Harm Reduction Week: Events Across Devon',
    excerpt: 'Join us for a week of awareness events, training sessions, and community gatherings as we mark International Harm Reduction Day.',
    body: [
      'From May 5th to 11th, Naloxone Advocates Plymouth will host Harm Reduction Week—seven days of events, training sessions, and community gatherings across Devon to raise awareness about overdose prevention and celebrate the power of community-led harm reduction.',
      'The week kicks off with a public awareness event in Plymouth city centre on Monday, May 5th, featuring information stalls, free naloxone training, and testimonials from people whose lives have been saved by naloxone. Local musicians and artists will perform throughout the day, creating a festival atmosphere that challenges stigma and celebrates survival.',
      'Throughout the week, we\'ll host training sessions in Devonport, Stonehouse, Plympton, Torquay, and Exeter, with evening sessions designed for working people and families. Each session is free and includes a take-home naloxone kit. We\'re also partnering with local libraries to host "Naloxone 101" information sessions for anyone curious about harm reduction.',
      'On Thursday, May 8th—International Harm Reduction Day—we\'ll hold a candlelight vigil in Plymouth to remember those lost to drug-related deaths and recommit ourselves to preventing future tragedies. The vigil will be followed by a community discussion about drug policy reform and the need for expanded harm reduction services.',
      'The week concludes with a celebration event on Sunday, May 11th, honouring our volunteers, peer trainers, and community partners. It\'s a chance to reflect on how far we\'ve come and energise ourselves for the work ahead. All events are free and open to the public—everyone is welcome, regardless of their connection to drug use.'
    ],
    date: '8 Jan 2025',
    datePublished: '2025-01-08',
    author: 'Priya Nair',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20South%20Asian%20British%20woman%20in%20her%20early%2030s%20with%20long%20dark%20hair%2C%20bright%20confident%20smile%2C%20wearing%20a%20coral%20top%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-priya&orientation=squarish',
    category: 'Events',
    image: 'https://readdy.ai/api/search-image?query=outdoor%20community%20awareness%20event%20with%20information%20stalls%20and%20banners%2C%20people%20gathering%20and%20talking%2C%20colorful%20promotional%20materials%2C%20sunny%20day%20in%20UK%20town%20square%2C%20documentary%20photography%20style&width=600&height=400&seq=news4&orientation=landscape',
    readTime: '3 min read'
  },
  {
    id: '5',
    title: 'Record-Breaking Training Month: 120 People Trained in December',
    excerpt: 'December 2024 saw our highest ever monthly training numbers, with 120 community members completing naloxone training across Plymouth and Devon.',
    body: [
      'December 2024 will go down in our history as our most impactful month yet. Despite the holiday season, 120 people completed naloxone training through our programme—shattering our previous monthly record of 87 set in October.',
      'The surge in training attendance reflects growing community awareness about overdose prevention and the life-saving power of naloxone. Many participants told us they were motivated by personal experiences—losing a friend or family member, witnessing an overdose, or simply wanting to be prepared to help in a crisis.',
      'Our peer trainers delivered 18 sessions across Plymouth and Devon in December, including special sessions for housing support workers, youth workers, and hospitality staff. We also held our first-ever "Family Training Day" specifically for parents and relatives of people who use drugs, which was fully booked within 48 hours of announcement.',
      'The record-breaking month was made possible by our incredible team of volunteer trainers who gave up their holiday time to deliver sessions. Marcus Thompson alone delivered six sessions in December, training 42 people. "Seeing that many people walk out with kits and confidence—that\'s the best Christmas present I could ask for," he said.',
      'As we enter 2025, we\'re building on this momentum with expanded training schedules and new partnerships. Our goal is to train 1,500 people this year, and December showed us that the community appetite for this knowledge is stronger than ever.'
    ],
    date: '2 Jan 2025',
    datePublished: '2025-01-02',
    author: 'Marcus Thompson',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20friendly%20Black%20British%20man%20in%20his%20early%2040s%20with%20a%20warm%20genuine%20smile%2C%20short%20hair%2C%20wearing%20a%20dark%20navy%20shirt%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-marcus&orientation=squarish',
    category: 'Milestone',
    image: 'https://readdy.ai/api/search-image?query=large%20group%20training%20session%20in%20community%20hall%2C%20many%20participants%20with%20naloxone%20kits%2C%20trainer%20at%20front%2C%20celebratory%20atmosphere%2C%20bright%20lighting%2C%20documentary%20photography&width=600&height=400&seq=news5&orientation=landscape',
    readTime: '2 min read'
  },
  {
    id: '6',
    title: 'New Outreach Van Launches for Street-Based Support',
    excerpt: 'Our new mobile outreach van will bring naloxone training and kits directly to communities across Plymouth, starting this February.',
    body: [
      'Thanks to a generous grant from the National Lottery Community Fund, Naloxone Advocates Plymouth is launching a mobile outreach van that will bring naloxone training and harm reduction support directly to communities across Plymouth and Devon.',
      'The custom-fitted van features a training space for up to 8 people, secure storage for naloxone kits and harm reduction supplies, and eye-catching branding that makes it impossible to miss. It\'s equipped with everything needed to deliver full training sessions on the street, in car parks, at community events, or anywhere people gather.',
      'The van addresses a critical gap in our service. While our community centre sessions are well-attended, they require people to travel and commit to a scheduled time. The mobile van meets people where they are—outside hostels, at food banks, in town centres, and at community events. It\'s harm reduction on wheels.',
      'Our outreach team will operate the van four days a week, following a rotating schedule that covers different neighbourhoods and times of day. The schedule will be published monthly on our website and social media, and we\'re always open to requests for specific locations or events.',
      'The van officially launches on February 10th with a week-long tour of Plymouth, stopping at 15 locations across the city. Each stop will offer free naloxone training, kit distribution, and information about our other services. We\'re calling it the "Naloxone Roadshow," and we can\'t wait to bring this life-saving resource directly to the people who need it most.'
    ],
    date: '28 Dec 2024',
    datePublished: '2024-12-28',
    author: 'Priya Nair',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20South%20Asian%20British%20woman%20in%20her%20early%2030s%20with%20long%20dark%20hair%2C%20bright%20confident%20smile%2C%20wearing%20a%20coral%20top%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-priya&orientation=squarish',
    category: 'Programme',
    image: 'https://readdy.ai/api/search-image?query=branded%20outreach%20van%20parked%20in%20Plymouth%20city%20centre%2C%20volunteers%20distributing%20naloxone%20kits%2C%20community%20engagement%2C%20bright%20daytime%2C%20documentary%20photography%20style&width=600&height=400&seq=news6&orientation=landscape',
    readTime: '3 min read'
  },
  {
    id: '7',
    title: 'Community Awards: Naloxone Advocates Recognised for Impact',
    excerpt: 'We are honoured to receive the Plymouth Community Impact Award 2024 for our work in harm reduction and overdose prevention.',
    body: [
      'On December 12th, Naloxone Advocates Plymouth CIC was awarded the Plymouth Community Impact Award 2024 at a ceremony attended by community leaders, health professionals, and local government officials. The award recognises organisations that have made exceptional contributions to improving lives in Plymouth.',
      'The judges praised our peer-led model, our rapid growth from a grassroots initiative to a city-wide programme, and our measurable impact on overdose prevention. "Naloxone Advocates Plymouth demonstrates what\'s possible when communities take ownership of public health challenges," the judges\' statement read. "Their work is saving lives and changing the conversation about drug use in Plymouth."',
      'Accepting the award, our founder Emma Richardson became emotional as she thanked the community. "This award belongs to every person who\'s attended a training, every peer trainer who\'s shared their story, and every family member who\'s had the courage to learn how to save a life. We\'re just the facilitators—the real heroes are the people carrying naloxone in their pockets every day."',
      'The award comes with a £5,000 grant that we\'re investing in expanding our peer trainer programme and purchasing additional naloxone kits for distribution. It also raises our profile significantly, opening doors to new partnerships and funding opportunities that will help us scale our impact.',
      'While we\'re deeply honoured by this recognition, we know the real measure of our success isn\'t awards—it\'s the 150 lives saved, the hundreds of people trained, and the growing movement of community members who refuse to stand by while people die from preventable overdoses. This award motivates us to work even harder in 2025 and beyond.'
    ],
    date: '15 Dec 2024',
    datePublished: '2024-12-15',
    author: 'Emma Richardson',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20confident%20British%20woman%20in%20her%20late%2030s%20with%20warm%20smile%2C%20short%20brown%20hair%2C%20wearing%20a%20teal%20blouse%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-emma&orientation=squarish',
    category: 'Milestone',
    image: 'https://readdy.ai/api/search-image?query=award%20ceremony%20with%20team%20members%20holding%20trophy%2C%20formal%20event%20setting%2C%20proud%20moment%2C%20professional%20photography%2C%20warm%20lighting&width=600&height=400&seq=news7&orientation=landscape',
    readTime: '2 min read'
  },
  {
    id: '8',
    title: 'Naloxone Kits Now Available at 15 New Locations',
    excerpt: 'We have expanded our distribution network with 15 new pickup points across Plymouth and Devon, making naloxone more accessible than ever.',
    body: [
      'Accessing naloxone just got easier. We\'ve partnered with 15 new locations across Plymouth and Devon where community members can pick up free naloxone kits without an appointment. The expansion means naloxone is now available at 32 locations across the region—the most comprehensive distribution network in the South West.',
      'New pickup points include community pharmacies, GP surgeries, youth centres, homeless shelters, and community hubs. Each location has staff trained in basic naloxone information who can provide kits and direct people to full training sessions. No questions asked, no judgment, just life-saving medication available when and where it\'s needed.',
      'The expansion was made possible through partnerships with Devon Local Pharmaceutical Committee, Plymouth Alliance, and individual community organisations who recognised the urgent need for accessible naloxone. Each partner location receives regular kit deliveries, promotional materials, and ongoing support from our team.',
      'Finding your nearest pickup point is simple. Our website features an interactive map showing all 32 locations, with opening hours, contact information, and directions. You can also text "NALOXONE" to our information line for the three closest locations to your postcode.',
      'This expansion is part of our vision to make naloxone as common and accessible as paracetamol. Every pharmacy, every GP surgery, every community space should have naloxone available. We\'re not there yet, but with 32 locations and counting, we\'re making real progress toward a future where no one dies from an opioid overdose because naloxone wasn\'t available.'
    ],
    date: '10 Dec 2024',
    datePublished: '2024-12-10',
    author: 'Priya Nair',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20South%20Asian%20British%20woman%20in%20her%20early%2030s%20with%20long%20dark%20hair%2C%20bright%20confident%20smile%2C%20wearing%20a%20coral%20top%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-priya&orientation=squarish',
    category: 'Events',
    image: 'https://readdy.ai/api/search-image?query=naloxone%20kit%20display%20at%20community%20pharmacy%2C%20information%20leaflets%20and%20kits%20on%20counter%2C%20welcoming%20environment%2C%20bright%20natural%20lighting%2C%20documentary%20photography&width=600&height=400&seq=news8&orientation=landscape',
    readTime: '2 min read'
  },
  {
    id: '9',
    title: '"I Carry Naloxone Everywhere Now" — A Peer Trainer\'s Story',
    excerpt: 'Marcus, a peer trainer from Devonport, shares how becoming a naloxone advocate transformed his relationship with his community and gave him a new sense of purpose.',
    body: [
      'Marcus Thompson keeps three naloxone kits on him at all times. One in his jacket pocket, one in his backpack, and one in his car. "I never leave home without them," he says, sitting in the Devonport Community Hub where he delivers training sessions twice a week. "They\'re as essential as my phone and my keys."',
      'Marcus\'s journey to becoming one of our lead peer trainers began in a dark place. After years of heroin use and two near-fatal overdoses, he entered recovery in 2022. "I was angry at first," he admits. "Angry at myself, angry at the system, angry at how people looked at me. I felt like I had nothing to offer anyone."',
      'A friend suggested he attend a naloxone training session, more as a way to get out of the house than anything else. "I almost didn\'t go. I thought, what\'s the point? But something made me show up." That decision changed everything. During the training, Marcus realised his lived experience wasn\'t a source of shame—it was a resource that could save lives.',
      'Within months, Marcus completed the peer trainer certification programme. "The first time I delivered a training session, I was terrified. My hands were shaking. But then I saw people really listening, really engaging, and I realised—they\'re listening because I\'ve been there. I have credibility that no doctor or nurse could have in that moment."',
      'Today, Marcus has trained over 150 people and personally used naloxone to reverse two overdoses in his neighbourhood. "The second time, it was someone I used to use with. Seeing him wake up, seeing his eyes open—that\'s when it really hit me. This is why I\'m here. This is my purpose." He pauses, emotion flickering across his face. "I used to think my past was wasted years. Now I know those years gave me exactly what I need to do this work. I carry naloxone everywhere now, and I carry hope too."'
    ],
    date: '5 Dec 2024',
    datePublished: '2024-12-05',
    author: 'Marcus Thompson',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20friendly%20Black%20British%20man%20in%20his%20early%2040s%20with%20a%20warm%20genuine%20smile%2C%20short%20hair%2C%20wearing%20a%20dark%20navy%20shirt%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-marcus&orientation=squarish',
    category: 'Story',
    image: 'https://readdy.ai/api/search-image?query=confident%20community%20peer%20trainer%20man%20in%20Plymouth%20neighbourhood%2C%20holding%20naloxone%20kit%2C%20warm%20natural%20light%2C%20documentary%20portrait%20photography%2C%20empowering%20and%20hopeful%20atmosphere%2C%20urban%20UK%20setting&width=600&height=400&seq=news9&orientation=landscape',
    readTime: '5 min read'
  },
  {
    id: '10',
    title: 'From Bystander to Life-Saver: Sarah\'s Story',
    excerpt: 'Sarah attended a community training session on a whim. Three weeks later, she used her naloxone kit to save her neighbour\'s life. This is her story.',
    body: [
      'Sarah Kennedy never imagined she\'d save someone\'s life. The 43-year-old teaching assistant from Stonehouse attended a naloxone training session in October "on a whim," after seeing a poster at her local library. "I had a free Saturday morning and thought, why not? It seemed like useful information to have."',
      'The training was delivered by one of our peer trainers at Stonehouse Community Hub. Sarah learned how to recognise an overdose, administer naloxone, and provide rescue breathing while waiting for paramedics. She left with a free naloxone kit and a certificate, tucking both into her bag and not thinking much more about it.',
      'Three weeks later, Sarah was returning home from grocery shopping when she noticed her neighbour\'s door was ajar. "I\'d seen him around but didn\'t really know him. Something told me to check. I knocked, called out, and when there was no answer, I pushed the door open." What she found was her neighbour collapsed on the floor, lips blue, barely breathing.',
      'Sarah\'s training kicked in immediately. "It was like autopilot. I checked for breathing, called 999, got my naloxone kit out. My hands were shaking but I remembered the steps—remove the cap, insert into nostril, press the plunger. I did it exactly like we practiced." Within two minutes, her neighbour gasped and started breathing more regularly. By the time paramedics arrived, he was conscious.',
      'The paramedics told Sarah she\'d saved his life. "I couldn\'t believe it. I kept thinking, I only went to that training because I had nothing else to do that morning. What if I hadn\'t gone? What if I hadn\'t had that kit?" Sarah now volunteers at our monthly awareness events, sharing her story and encouraging others to get trained. "You never think it\'ll be you. You never think you\'ll be the one who needs to act. But when the moment comes, you\'ll be so grateful you learned. That training turned me from a bystander into someone who could actually help. Everyone should have that power."'
    ],
    date: '20 Nov 2024',
    datePublished: '2024-11-20',
    author: 'Emma Richardson',
    authorPhoto: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20confident%20British%20woman%20in%20her%20late%2030s%20with%20warm%20smile%2C%20short%20brown%20hair%2C%20wearing%20a%20teal%20blouse%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-emma&orientation=squarish',
    category: 'Story',
    image: 'https://readdy.ai/api/search-image?query=woman%20holding%20naloxone%20kit%20outdoors%20in%20Plymouth%2C%20warm%20smile%2C%20community%20setting%2C%20natural%20daylight%2C%20documentary%20photography%2C%20empowering%20and%20proud%20moment%2C%20harm%20reduction%20advocate&width=600&height=400&seq=news10&orientation=landscape',
    readTime: '6 min read'
  },
];
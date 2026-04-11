// ─── Helpers ─────────────────────────────────────────────
const av  = (n) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.replace(/\s/g,'')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
const ph  = (h, w) => ({ height: h, weight: w, bmi: +(w / (h / 100) ** 2).toFixed(1) });
const fit = (e, st, sp, fl) => ({
  endurance:    e,
  strength:     st,
  speed:        sp,
  flexibility:  fl,
  agility:      Math.min(99, Math.max(50, Math.round(sp * 0.82 + fl * 0.12 + (e + st) * 0.03))),
  power:        Math.min(99, Math.max(50, Math.round(st * 0.80 + e  * 0.10 + (sp + fl) * 0.05))),
  stamina:      Math.min(99, Math.max(50, Math.round(e  * 0.85 + st * 0.08 + (sp + fl) * 0.035))),
  balance:      Math.min(99, Math.max(50, Math.round(fl * 0.50 + sp * 0.30 + st * 0.12 + e * 0.08))),
  reaction:     Math.min(99, Math.max(50, Math.round(sp * 0.50 + fl * 0.25 + e  * 0.15 + st * 0.10))),
  coordination: Math.min(99, Math.max(50, Math.round(sp * 0.35 + fl * 0.32 + e  * 0.22 + st * 0.11))),
});
const tr  = (date, type, duration, notes, intensity = 'medium') => ({ date, type, duration, notes, intensity });
const inj = (status, detail = '') => ({ status, detail });

// ─── Sports meta ─────────────────────────────────────────
export const SPORTS = {
  soccer:     { label: 'Soccer',           icon: '⚽', color: '#4ecdc4' },
  basketball: { label: 'Basketball',       icon: '🏀', color: '#ffd93d' },
  football:   { label: 'American Football',icon: '🏈', color: '#ff6b6b' },
};

export const TEAMS = {
  // Soccer
  'Red Dragons FC':     { sport: 'soccer',     color: '#ef4444' },
  'Blue Hawks United':  { sport: 'soccer',     color: '#3b82f6' },
  'Thunder Lions FC':   { sport: 'soccer',     color: '#f59e0b' },
  // Basketball
  'Golden Eagles':      { sport: 'basketball', color: '#eab308' },
  'Silver Wolves':      { sport: 'basketball', color: '#94a3b8' },
  'Storm Falcons':      { sport: 'basketball', color: '#8b5cf6' },
  // American Football
  'Iron Titans':        { sport: 'football',   color: '#64748b' },
  'Steel Panthers':     { sport: 'football',   color: '#059669' },
  'Diamond Knights':    { sport: 'football',   color: '#0ea5e9' },
};

// ─── Athletes (102 players) ───────────────────────────────
export const athletes = [

  // ══════════ ⚽  RED DRAGONS FC ══════════
  {
    _id: 's01', name: 'Marcus Torres',    age: 22, sport: 'soccer', team: 'Red Dragons FC', position: 'GK', number: 1,
    avatar: av('Marcus Torres'),    physicalData: ph(188, 82), fitness: fit(78, 84, 68, 72),
    injury: inj('healthy'),
    training: [tr('2024-01-06','cardio',40,'Goalkeeper agility drills'), tr('2024-01-10','strength',50,'Core and upper body'), tr('2024-01-14','flexibility',30,'Full-body stretch')],
  },
  {
    _id: 's02', name: 'Alex Martinez',    age: 20, sport: 'soccer', team: 'Red Dragons FC', position: 'CB', number: 4,
    avatar: av('Alex Martinez'),    physicalData: ph(185, 80), fitness: fit(80, 86, 76, 74),
    injury: inj('healthy'),
    training: [tr('2024-01-07','strength',55,'Lower body & plyometrics'), tr('2024-01-11','tactical',45,'Defensive shape'), tr('2024-01-15','cardio',35,'Interval run')],
  },
  {
    _id: 's03', name: 'Liam Chen',        age: 21, sport: 'soccer', team: 'Red Dragons FC', position: 'CB', number: 5,
    avatar: av('Liam Chen'),        physicalData: ph(183, 78), fitness: fit(82, 84, 78, 76),
    injury: inj('minor', 'Mild left knee strain, receiving physiotherapy'),
    training: [tr('2024-01-08','flexibility',35,'Low-impact rehab stretch'), tr('2024-01-12','strength',40,'Reduced load — knee protocol'), tr('2024-01-16','cardio',25,'Light jog, no contact')],
  },
  {
    _id: 's04', name: 'Carlos Rivera',    age: 19, sport: 'soccer', team: 'Red Dragons FC', position: 'LB', number: 3,
    avatar: av('Carlos Rivera'),    physicalData: ph(179, 72), fitness: fit(86, 76, 88, 78),
    injury: inj('healthy'),
    training: [tr('2024-01-05','speed',30,'Flank sprint drills'), tr('2024-01-09','cardio',45,'Endurance run'), tr('2024-01-13','tactical',40,'Overlap patterns')],
  },
  {
    _id: 's05', name: 'Kevin Park',       age: 20, sport: 'soccer', team: 'Red Dragons FC', position: 'RB', number: 2,
    avatar: av('Kevin Park'),       physicalData: ph(177, 71), fitness: fit(84, 78, 90, 76),
    injury: inj('healthy'),
    training: [tr('2024-01-06','speed',25,'Wing sprint + cross'), tr('2024-01-10','cardio',40,'Aerobic base run'), tr('2024-01-14','strength',35,'Hip & glute stability')],
  },
  {
    _id: 's06', name: 'David Nguyen',     age: 22, sport: 'soccer', team: 'Red Dragons FC', position: 'CM', number: 8,
    avatar: av('David Nguyen'),     physicalData: ph(180, 74), fitness: fit(91, 80, 85, 80),
    injury: inj('healthy'),
    training: [tr('2024-01-07','cardio',50,'High-press midfield run'), tr('2024-01-11','tactical',60,'Box-to-box patterns'), tr('2024-01-15','strength',40,'Legs & core')],
  },
  {
    _id: 's07', name: 'Antoine Dupont',   age: 21, sport: 'soccer', team: 'Red Dragons FC', position: 'CM', number: 6,
    avatar: av('Antoine Dupont'),   physicalData: ph(176, 70), fitness: fit(90, 78, 86, 84),
    injury: inj('recovering', 'Recovering from groin strain, expected return in 2 weeks'),
    training: [tr('2024-01-08','flexibility',40,'Groin recovery protocol'), tr('2024-01-12','cardio',20,'Light pool running'), tr('2024-01-16','strength',30,'Modified upper body only')],
  },
  {
    _id: 's08', name: 'Hugo Leclerc',     age: 20, sport: 'soccer', team: 'Red Dragons FC', position: 'CAM', number: 10,
    avatar: av('Hugo Leclerc'),     physicalData: ph(178, 71), fitness: fit(87, 76, 91, 88),
    injury: inj('healthy'),
    training: [tr('2024-01-05','shooting',60,'Finishing in tight spaces'), tr('2024-01-09','speed',35,'1v1 dribbling sprints'), tr('2024-01-13','tactical',50,'Playmaking drills')],
  },
  {
    _id: 's09', name: 'Rodrigo Santos',   age: 19, sport: 'soccer', team: 'Red Dragons FC', position: 'LW', number: 11,
    avatar: av('Rodrigo Santos'),   physicalData: ph(175, 68), fitness: fit(88, 72, 95, 85),
    injury: inj('healthy'),
    training: [tr('2024-01-06','speed',40,'Winger acceleration work'), tr('2024-01-10','shooting',45,'Cut-inside & shoot'), tr('2024-01-14','cardio',35,'Tempo run')],
  },
  {
    _id: 's10', name: 'James Wilson',     age: 21, sport: 'soccer', team: 'Red Dragons FC', position: 'RW', number: 7,
    avatar: av('James Wilson'),     physicalData: ph(177, 70), fitness: fit(86, 74, 93, 82),
    injury: inj('healthy'),
    training: [tr('2024-01-07','speed',45,'Crossing & sprint'), tr('2024-01-11','shooting',40,'Power shots from range'), tr('2024-01-15','tactical',50,'Wing press patterns')],
  },
  {
    _id: 's11', name: 'Diego Morales',    age: 22, sport: 'soccer', team: 'Red Dragons FC', position: 'ST', number: 9,
    avatar: av('Diego Morales'),    physicalData: ph(181, 77), fitness: fit(84, 82, 90, 78),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',60,'Striker movement & finishing'), tr('2024-01-12','strength',50,'Hold-up play physical'), tr('2024-01-16','speed',30,'Box runs & timing')],
  },

  // ══════════ ⚽  BLUE HAWKS UNITED ══════════
  {
    _id: 's12', name: 'Tyler Brooks',     age: 21, sport: 'soccer', team: 'Blue Hawks United', position: 'GK', number: 1,
    avatar: av('Tyler Brooks'),     physicalData: ph(190, 85), fitness: fit(76, 85, 65, 70),
    injury: inj('healthy'),
    training: [tr('2024-01-06','strength',55,'Goalkeeper cross claim'), tr('2024-01-10','flexibility',30,'Shot-stopping elasticity'), tr('2024-01-14','cardio',30,'Interval footwork')],
  },
  {
    _id: 's13', name: 'Nathan Kim',       age: 20, sport: 'soccer', team: 'Blue Hawks United', position: 'CB', number: 4,
    avatar: av('Nathan Kim'),       physicalData: ph(184, 79), fitness: fit(81, 87, 77, 75),
    injury: inj('healthy'),
    training: [tr('2024-01-07','strength',50,'Aerial duel training'), tr('2024-01-11','tactical',45,'Offside trap timing'), tr('2024-01-15','cardio',35,'Long-run recovery')],
  },
  {
    _id: 's14', name: 'Ethan Davis',      age: 22, sport: 'soccer', team: 'Blue Hawks United', position: 'CB', number: 5,
    avatar: av('Ethan Davis'),      physicalData: ph(186, 82), fitness: fit(79, 88, 74, 73),
    injury: inj('injured', 'Right ankle fracture, estimated 6–8 week recovery'),
    training: [tr('2024-01-08','flexibility',20,'Upper body only'), tr('2024-01-12','strength',30,'Crutch-compliant upper'), tr('2024-01-16','flexibility',25,'Ankle RICE protocol')],
  },
  {
    _id: 's15', name: 'Lucas Fernandez',  age: 19, sport: 'soccer', team: 'Blue Hawks United', position: 'LB', number: 3,
    avatar: av('Lucas Fernandez'),  physicalData: ph(178, 71), fitness: fit(87, 77, 89, 80),
    injury: inj('healthy'),
    training: [tr('2024-01-05','speed',35,'Winger suppression runs'), tr('2024-01-09','cardio',45,'Endurance base'), tr('2024-01-13','tactical',40,'Overlap timing')],
  },
  {
    _id: 's16', name: 'Ryan Thompson',    age: 21, sport: 'soccer', team: 'Blue Hawks United', position: 'RB', number: 2,
    avatar: av('Ryan Thompson'),    physicalData: ph(180, 73), fitness: fit(85, 79, 87, 77),
    injury: inj('healthy'),
    training: [tr('2024-01-06','speed',30,'Defensive sprint-back'), tr('2024-01-10','cardio',40,'Aerobic session'), tr('2024-01-14','shooting',30,'Crossing work')],
  },
  {
    _id: 's17', name: 'Felipe Oliveira',  age: 20, sport: 'soccer', team: 'Blue Hawks United', position: 'CM', number: 8,
    avatar: av('Felipe Oliveira'),  physicalData: ph(179, 73), fitness: fit(92, 79, 86, 82),
    injury: inj('healthy'),
    training: [tr('2024-01-07','cardio',55,'Pressing simulation'), tr('2024-01-11','tactical',50,'Positional rondos'), tr('2024-01-15','strength',40,'Midfield strength block')],
  },
  {
    _id: 's18', name: 'Pierre Blanc',     age: 22, sport: 'soccer', team: 'Blue Hawks United', position: 'CM', number: 6,
    avatar: av('Pierre Blanc'),     physicalData: ph(177, 72), fitness: fit(89, 77, 84, 85),
    injury: inj('minor', 'Mild back tightness, under physiotherapy'),
    training: [tr('2024-01-08','flexibility',40,'Lower back mobility'), tr('2024-01-12','cardio',30,'Reduced impact jog'), tr('2024-01-16','tactical',35,'Video analysis session')],
  },
  {
    _id: 's19', name: 'Maxime Garnier',   age: 19, sport: 'soccer', team: 'Blue Hawks United', position: 'CAM', number: 10,
    avatar: av('Maxime Garnier'),   physicalData: ph(176, 69), fitness: fit(86, 75, 92, 89),
    injury: inj('healthy'),
    training: [tr('2024-01-05','shooting',55,'Through-ball & run'), tr('2024-01-09','speed',40,'Quick-turn dribbling'), tr('2024-01-13','tactical',50,'False-9 movements')],
  },
  {
    _id: 's20', name: 'Thiago Costa',     age: 21, sport: 'soccer', team: 'Blue Hawks United', position: 'LW', number: 11,
    avatar: av('Thiago Costa'),     physicalData: ph(174, 67), fitness: fit(89, 71, 96, 86),
    injury: inj('healthy'),
    training: [tr('2024-01-06','speed',45,'Acceleration & width'), tr('2024-01-10','shooting',40,'Low-cross & cut-in'), tr('2024-01-14','cardio',35,'Recovery run')],
  },
  {
    _id: 's21', name: 'Brandon Lee',      age: 20, sport: 'soccer', team: 'Blue Hawks United', position: 'RW', number: 7,
    avatar: av('Brandon Lee'),      physicalData: ph(175, 68), fitness: fit(87, 73, 94, 83),
    injury: inj('healthy'),
    training: [tr('2024-01-07','speed',40,'Counter-attack sprints'), tr('2024-01-11','shooting',45,'Combination finishing'), tr('2024-01-15','cardio',35,'Aerobic base')],
  },
  {
    _id: 's22', name: 'Miguel Sanchez',   age: 22, sport: 'soccer', team: 'Blue Hawks United', position: 'ST', number: 9,
    avatar: av('Miguel Sanchez'),   physicalData: ph(182, 78), fitness: fit(83, 83, 89, 77),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',65,'Penalty box movement'), tr('2024-01-12','strength',45,'Physical hold-up'), tr('2024-01-16','speed',30,'First touch & turn')],
  },

  // ══════════ ⚽  THUNDER LIONS FC ══════════
  {
    _id: 's23', name: 'Jordan Hayes',     age: 20, sport: 'soccer', team: 'Thunder Lions FC', position: 'GK', number: 1,
    avatar: av('Jordan Hayes'),     physicalData: ph(187, 84), fitness: fit(75, 83, 66, 71),
    injury: inj('healthy'),
    training: [tr('2024-01-06','strength',50,'Distribution & kicking'), tr('2024-01-10','flexibility',35,'Stretch & reflex'), tr('2024-01-14','cardio',25,'Footwork ladders')],
  },
  {
    _id: 's24', name: 'Pablo Ruiz',       age: 21, sport: 'soccer', team: 'Thunder Lions FC', position: 'CB', number: 4,
    avatar: av('Pablo Ruiz'),       physicalData: ph(184, 80), fitness: fit(80, 86, 76, 74),
    injury: inj('healthy'),
    training: [tr('2024-01-07','strength',55,'Header & physical duel'), tr('2024-01-11','tactical',45,'Zonal defensive marking'), tr('2024-01-15','cardio',35,'Interval run')],
  },
  {
    _id: 's25', name: 'Chris Walker',     age: 19, sport: 'soccer', team: 'Thunder Lions FC', position: 'CB', number: 5,
    avatar: av('Chris Walker'),     physicalData: ph(182, 77), fitness: fit(83, 85, 79, 76),
    injury: inj('recovering', 'Hamstring strain, 2-week recovery, progressing well'),
    training: [tr('2024-01-08','flexibility',45,'Hamstring recovery'), tr('2024-01-12','strength',35,'Partial load'), tr('2024-01-16','cardio',20,'Low-intensity bike')],
  },
  {
    _id: 's26', name: 'Andres Gomez',     age: 22, sport: 'soccer', team: 'Thunder Lions FC', position: 'LB', number: 3,
    avatar: av('Andres Gomez'),     physicalData: ph(178, 72), fitness: fit(85, 76, 87, 79),
    injury: inj('healthy'),
    training: [tr('2024-01-05','speed',35,'Burst and recovery'), tr('2024-01-09','cardio',45,'Endurance run'), tr('2024-01-13','tactical',40,'Overlapping runs')],
  },
  {
    _id: 's27', name: 'Samuel Park',      age: 20, sport: 'soccer', team: 'Thunder Lions FC', position: 'RB', number: 2,
    avatar: av('Samuel Park'),      physicalData: ph(176, 70), fitness: fit(86, 78, 88, 77),
    injury: inj('healthy'),
    training: [tr('2024-01-06','speed',30,'Tight-angle defending'), tr('2024-01-10','cardio',40,'Long-run base'), tr('2024-01-14','shooting',25,'Crossing delivery')],
  },
  {
    _id: 's28', name: 'Bruno Ferreira',   age: 21, sport: 'soccer', team: 'Thunder Lions FC', position: 'CM', number: 8,
    avatar: av('Bruno Ferreira'),   physicalData: ph(180, 74), fitness: fit(91, 78, 85, 81),
    injury: inj('healthy'),
    training: [tr('2024-01-07','cardio',55,'Engine-room high press'), tr('2024-01-11','tactical',50,'Transition play'), tr('2024-01-15','strength',40,'Explosive squats')],
  },
  {
    _id: 's29', name: 'Theo Bernard',     age: 19, sport: 'soccer', team: 'Thunder Lions FC', position: 'CM', number: 6,
    avatar: av('Theo Bernard'),     physicalData: ph(177, 71), fitness: fit(88, 77, 83, 83),
    injury: inj('healthy'),
    training: [tr('2024-01-08','tactical',50,'Pass-and-move patterns'), tr('2024-01-12','cardio',45,'Medium intensity run'), tr('2024-01-16','strength',35,'Mid-week gym')],
  },
  {
    _id: 's30', name: 'Rafael Cruz',      age: 22, sport: 'soccer', team: 'Thunder Lions FC', position: 'CAM', number: 10,
    avatar: av('Rafael Cruz'),      physicalData: ph(177, 70), fitness: fit(85, 74, 90, 88),
    injury: inj('healthy'),
    training: [tr('2024-01-05','shooting',60,'Creative link-up play'), tr('2024-01-09','speed',35,'Quick turn drills'), tr('2024-01-13','tactical',55,'Set-piece delivery')],
  },
  {
    _id: 's31', name: 'Sergio Villa',     age: 20, sport: 'soccer', team: 'Thunder Lions FC', position: 'LW', number: 11,
    avatar: av('Sergio Villa'),     physicalData: ph(173, 66), fitness: fit(87, 70, 95, 87),
    injury: inj('minor', 'Minor ankle sprain, currently icing'),
    training: [tr('2024-01-06','flexibility',40,'Ankle mobility'), tr('2024-01-10','cardio',20,'Pool jogging'), tr('2024-01-14','speed',25,'Straight-line sprint only')],
  },
  {
    _id: 's32', name: 'Jake Morrison',    age: 21, sport: 'soccer', team: 'Thunder Lions FC', position: 'RW', number: 7,
    avatar: av('Jake Morrison'),    physicalData: ph(176, 69), fitness: fit(86, 72, 93, 84),
    injury: inj('healthy'),
    training: [tr('2024-01-07','speed',40,'Wide play & cross'), tr('2024-01-11','shooting',45,'Cut-inside finish'), tr('2024-01-15','cardio',35,'Aerobic maintenance')],
  },
  {
    _id: 's33', name: 'Omar Hassan',      age: 22, sport: 'soccer', team: 'Thunder Lions FC', position: 'ST', number: 9,
    avatar: av('Omar Hassan'),      physicalData: ph(182, 79), fitness: fit(84, 81, 91, 76),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',65,'Striker hold-up & shot'), tr('2024-01-12','strength',50,'Physical presence'), tr('2024-01-16','speed',30,'Box timing runs')],
  },

  // ══════════ 🏀  GOLDEN EAGLES ══════════
  {
    _id: 'b01', name: 'Isaiah Turner',    age: 20, sport: 'basketball', team: 'Golden Eagles', position: 'PG', number: 1,
    avatar: av('Isaiah Turner'),    physicalData: ph(185, 80), fitness: fit(88, 75, 94, 82),
    injury: inj('healthy'),
    training: [tr('2024-01-07','dribbling',60,'Full-court dribbling'), tr('2024-01-11','shooting',50,'Pick-and-roll finishing'), tr('2024-01-15','cardio',40,'Full-court sprints')],
  },
  {
    _id: 'b02', name: 'Marcus Bell',      age: 21, sport: 'basketball', team: 'Golden Eagles', position: 'SG', number: 2,
    avatar: av('Marcus Bell'),      physicalData: ph(193, 88), fitness: fit(84, 80, 91, 78),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',65,'Catch-and-shoot drills'), tr('2024-01-12','speed',45,'Closeout defense'), tr('2024-01-16','strength',40,'Lateral resistance')],
  },
  {
    _id: 'b03', name: 'DeAndre Mitchell', age: 22, sport: 'basketball', team: 'Golden Eagles', position: 'SF', number: 3,
    avatar: av('DeAndre Mitchell'), physicalData: ph(200, 100), fitness: fit(82, 86, 86, 76),
    injury: inj('healthy'),
    training: [tr('2024-01-09','strength',55,'Wing post moves'), tr('2024-01-13','shooting',50,'Mid-range jumper'), tr('2024-01-17','cardio',40,'Transition running')],
  },
  {
    _id: 'b04', name: 'Jaylen Brooks',    age: 20, sport: 'basketball', team: 'Golden Eagles', position: 'PF', number: 4,
    avatar: av('Jaylen Brooks'),    physicalData: ph(203, 108), fitness: fit(79, 90, 82, 73),
    injury: inj('recovering', 'Right shoulder muscle strain recovering, strength training restricted'),
    training: [tr('2024-01-07','flexibility',45,'Shoulder rehab protocol'), tr('2024-01-11','cardio',35,'Lower body only run'), tr('2024-01-15','dribbling',40,'Ball handling — no contact')],
  },
  {
    _id: 'b05', name: 'Dominic Foster',   age: 22, sport: 'basketball', team: 'Golden Eagles', position: 'C', number: 5,
    avatar: av('Dominic Foster'),   physicalData: ph(211, 118), fitness: fit(74, 92, 72, 68),
    injury: inj('healthy'),
    training: [tr('2024-01-08','strength',60,'Post footwork & power'), tr('2024-01-12','cardio',35,'Rim-to-rim shuttle'), tr('2024-01-16','shooting',40,'Drop-step & hook')],
  },
  {
    _id: 'b06', name: 'Elijah Ross',      age: 19, sport: 'basketball', team: 'Golden Eagles', position: 'PG', number: 11,
    avatar: av('Elijah Ross'),      physicalData: ph(183, 78), fitness: fit(89, 74, 93, 84),
    injury: inj('healthy'),
    training: [tr('2024-01-09','dribbling',55,'Court-vision dribble sets'), tr('2024-01-13','shooting',45,'Floater & layup'), tr('2024-01-17','cardio',40,'Defensive slide series')],
  },
  {
    _id: 'b07', name: 'Cameron Hayes',    age: 21, sport: 'basketball', team: 'Golden Eagles', position: 'SG', number: 12,
    avatar: av('Cameron Hayes'),    physicalData: ph(195, 90), fitness: fit(83, 81, 89, 79),
    injury: inj('minor', 'Mild knee discomfort, preventive treatment applied'),
    training: [tr('2024-01-07','shooting',60,'Spot-up three-point'), tr('2024-01-11','strength',40,'Reduced load'), tr('2024-01-15','flexibility',35,'Knee stability work')],
  },
  {
    _id: 'b08', name: 'Xavier Cole',      age: 20, sport: 'basketball', team: 'Golden Eagles', position: 'SF', number: 13,
    avatar: av('Xavier Cole'),      physicalData: ph(198, 97), fitness: fit(81, 85, 87, 77),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',55,'Face-up jumper'), tr('2024-01-12','strength',50,'Upper body press'), tr('2024-01-16','speed',40,'Wing closeout drills')],
  },
  {
    _id: 'b09', name: 'Malik Washington', age: 22, sport: 'basketball', team: 'Golden Eagles', position: 'PF', number: 14,
    avatar: av('Malik Washington'), physicalData: ph(205, 110), fitness: fit(78, 91, 80, 71),
    injury: inj('healthy'),
    training: [tr('2024-01-09','strength',65,'High-low post game'), tr('2024-01-13','cardio',40,'Conditioning circuit'), tr('2024-01-17','shooting',45,'Pull-up mid-range')],
  },
  {
    _id: 'b10', name: 'Anthony Price',    age: 21, sport: 'basketball', team: 'Golden Eagles', position: 'C', number: 15,
    avatar: av('Anthony Price'),    physicalData: ph(213, 120), fitness: fit(72, 93, 70, 66),
    injury: inj('healthy'),
    training: [tr('2024-01-07','strength',65,'Rim protection footwork'), tr('2024-01-11','shooting',40,'Free throw routine'), tr('2024-01-15','cardio',30,'Low-impact cardio')],
  },
  {
    _id: 'b11', name: 'Jordan Smith',     age: 19, sport: 'basketball', team: 'Golden Eagles', position: 'SG', number: 21,
    avatar: av('Jordan Smith'),     physicalData: ph(191, 86), fitness: fit(85, 79, 90, 80),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',60,'Off-screen shooting'), tr('2024-01-12','dribbling',45,'Combo guard handle'), tr('2024-01-16','cardio',40,'Full-court press break')],
  },
  {
    _id: 'b12', name: 'Brendan Clark',    age: 20, sport: 'basketball', team: 'Golden Eagles', position: 'SF', number: 22,
    avatar: av('Brendan Clark'),    physicalData: ph(201, 101), fitness: fit(80, 84, 85, 78),
    injury: inj('healthy'),
    training: [tr('2024-01-09','strength',50,'Wing athleticism block'), tr('2024-01-13','shooting',55,'Transition three-point'), tr('2024-01-17','speed',40,'Half-court defense')],
  },

  // ══════════ 🏀  SILVER WOLVES ══════════
  {
    _id: 'b13', name: 'Tyler James',      age: 21, sport: 'basketball', team: 'Silver Wolves', position: 'PG', number: 1,
    avatar: av('Tyler James'),      physicalData: ph(186, 82), fitness: fit(87, 76, 92, 83),
    injury: inj('healthy'),
    training: [tr('2024-01-07','dribbling',60,'Pick-and-roll reads'), tr('2024-01-11','shooting',50,'Pull-up off dribble'), tr('2024-01-15','cardio',45,'Full-court conditioning')],
  },
  {
    _id: 'b14', name: 'Kevin Chen',       age: 20, sport: 'basketball', team: 'Silver Wolves', position: 'SG', number: 2,
    avatar: av('Kevin Chen'),       physicalData: ph(192, 87), fitness: fit(83, 80, 90, 79),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',65,'Shooting guard package'), tr('2024-01-12','speed',40,'Defensive footwork'), tr('2024-01-16','strength',40,'Upper body blast')],
  },
  {
    _id: 'b15', name: 'Darius Hill',      age: 22, sport: 'basketball', team: 'Silver Wolves', position: 'SF', number: 3,
    avatar: av('Darius Hill'),      physicalData: ph(199, 99), fitness: fit(81, 86, 87, 77),
    injury: inj('healthy'),
    training: [tr('2024-01-09','strength',55,'3-and-D wing drills'), tr('2024-01-13','shooting',50,'Corner three routine'), tr('2024-01-17','cardio',40,'Sprint ladder')],
  },
  {
    _id: 'b16', name: 'Marcus Johnson',   age: 19, sport: 'basketball', team: 'Silver Wolves', position: 'PF', number: 4,
    avatar: av('Marcus Johnson'),   physicalData: ph(204, 107), fitness: fit(78, 89, 81, 72),
    injury: inj('minor', 'Minor right thumb sprain, bandaged'),
    training: [tr('2024-01-07','cardio',40,'No-contact conditioning'), tr('2024-01-11','strength',50,'Lower body focus'), tr('2024-01-15','shooting',35,'Left-hand dominant drills')],
  },
  {
    _id: 'b17', name: 'Leon Baptiste',    age: 21, sport: 'basketball', team: 'Silver Wolves', position: 'C', number: 5,
    avatar: av('Leon Baptiste'),    physicalData: ph(210, 116), fitness: fit(73, 92, 71, 67),
    injury: inj('healthy'),
    training: [tr('2024-01-08','strength',65,'Post seal & pivot'), tr('2024-01-12','cardio',35,'Conditioning'), tr('2024-01-16','shooting',40,'Post scoring package')],
  },
  {
    _id: 'b18', name: 'Nathan Scott',     age: 20, sport: 'basketball', team: 'Silver Wolves', position: 'PG', number: 11,
    avatar: av('Nathan Scott'),     physicalData: ph(184, 79), fitness: fit(89, 75, 92, 84),
    injury: inj('healthy'),
    training: [tr('2024-01-09','dribbling',55,'Tight handle pressure'), tr('2024-01-13','shooting',45,'Floater & runner'), tr('2024-01-17','cardio',45,'End-to-end sprints')],
  },
  {
    _id: 'b19', name: 'Devon Wright',     age: 22, sport: 'basketball', team: 'Silver Wolves', position: 'SG', number: 12,
    avatar: av('Devon Wright'),     physicalData: ph(194, 89), fitness: fit(84, 81, 89, 80),
    injury: inj('healthy'),
    training: [tr('2024-01-07','shooting',60,'Volume shooting workout'), tr('2024-01-11','speed',40,'On-ball defense'), tr('2024-01-15','strength',45,'Guard strength')],
  },
  {
    _id: 'b20', name: 'Cody Evans',       age: 19, sport: 'basketball', team: 'Silver Wolves', position: 'SF', number: 13,
    avatar: av('Cody Evans'),       physicalData: ph(197, 95), fitness: fit(82, 84, 88, 77),
    injury: inj('recovering', 'Groin strain recovery, contact training suspended'),
    training: [tr('2024-01-08','flexibility',45,'Groin recovery'), tr('2024-01-12','cardio',25,'Bike interval'), tr('2024-01-16','shooting',35,'Stationary shooting only')],
  },
  {
    _id: 'b21', name: 'Tristan Long',     age: 21, sport: 'basketball', team: 'Silver Wolves', position: 'PF', number: 14,
    avatar: av('Tristan Long'),     physicalData: ph(206, 111), fitness: fit(77, 90, 79, 71),
    injury: inj('healthy'),
    training: [tr('2024-01-09','strength',60,'Power block training'), tr('2024-01-13','cardio',40,'Transition sprint'), tr('2024-01-17','shooting',45,'Pick-and-pop')],
  },
  {
    _id: 'b22', name: 'Robert King',      age: 22, sport: 'basketball', team: 'Silver Wolves', position: 'C', number: 15,
    avatar: av('Robert King'),      physicalData: ph(212, 119), fitness: fit(71, 94, 69, 65),
    injury: inj('healthy'),
    training: [tr('2024-01-07','strength',65,'Anchor defensive post'), tr('2024-01-11','shooting',40,'Short-range scoring'), tr('2024-01-15','cardio',30,'Low-impact conditioning')],
  },
  {
    _id: 'b23', name: 'Aaron Brooks',     age: 20, sport: 'basketball', team: 'Silver Wolves', position: 'PG', number: 21,
    avatar: av('Aaron Brooks'),     physicalData: ph(185, 80), fitness: fit(90, 74, 93, 85),
    injury: inj('healthy'),
    training: [tr('2024-01-08','dribbling',60,'Speed handle'), tr('2024-01-12','shooting',50,'Mid-range package'), tr('2024-01-16','cardio',45,'Defensive sprint drills')],
  },
  {
    _id: 'b24', name: 'Shane Nelson',     age: 21, sport: 'basketball', team: 'Silver Wolves', position: 'SG', number: 22,
    avatar: av('Shane Nelson'),     physicalData: ph(193, 88), fitness: fit(83, 80, 90, 80),
    injury: inj('healthy'),
    training: [tr('2024-01-09','shooting',60,'Shooting off screens'), tr('2024-01-13','strength',45,'Perimeter strength'), tr('2024-01-17','speed',40,'Closeout reaction')],
  },

  // ══════════ 🏀  STORM FALCONS ══════════
  {
    _id: 'b25', name: 'Chris Murphy',     age: 19, sport: 'basketball', team: 'Storm Falcons', position: 'PG', number: 1,
    avatar: av('Chris Murphy'),     physicalData: ph(184, 79), fitness: fit(91, 73, 95, 86),
    injury: inj('healthy'),
    training: [tr('2024-01-07','dribbling',60,'Point guard IQ drills'), tr('2024-01-11','shooting',55,'Off-the-bounce three'), tr('2024-01-15','cardio',50,'Full-court runs')],
  },
  {
    _id: 'b26', name: 'Derek Powell',     age: 20, sport: 'basketball', team: 'Storm Falcons', position: 'SG', number: 2,
    avatar: av('Derek Powell'),     physicalData: ph(194, 90), fitness: fit(84, 82, 90, 79),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',65,'Shooting guard volume'), tr('2024-01-12','speed',40,'Defensive slides'), tr('2024-01-16','strength',45,'Upper blast')],
  },
  {
    _id: 'b27', name: 'Quincy Adams',     age: 21, sport: 'basketball', team: 'Storm Falcons', position: 'SF', number: 3,
    avatar: av('Quincy Adams'),     physicalData: ph(200, 100), fitness: fit(82, 86, 87, 77),
    injury: inj('minor', 'Mild left knee patellar inflammation, icing and anti-inflammatory treatment'),
    training: [tr('2024-01-09','flexibility',45,'Knee rehab stretch'), tr('2024-01-13','shooting',40,'Stationary spot shooting'), tr('2024-01-17','strength',35,'Leg reduced load')],
  },
  {
    _id: 'b28', name: 'Jerome Banks',     age: 22, sport: 'basketball', team: 'Storm Falcons', position: 'PF', number: 4,
    avatar: av('Jerome Banks'),     physicalData: ph(205, 109), fitness: fit(79, 91, 81, 72),
    injury: inj('healthy'),
    training: [tr('2024-01-07','strength',65,'Banging the boards'), tr('2024-01-11','shooting',45,'High-low post scoring'), tr('2024-01-15','cardio',40,'Transition conditioning')],
  },
  {
    _id: 'b29', name: 'Victor Stone',     age: 20, sport: 'basketball', team: 'Storm Falcons', position: 'C', number: 5,
    avatar: av('Victor Stone'),     physicalData: ph(210, 117), fitness: fit(73, 93, 71, 67),
    injury: inj('healthy'),
    training: [tr('2024-01-08','strength',65,'Rim-running & shot-blocking'), tr('2024-01-12','cardio',35,'Low-impact conditioning'), tr('2024-01-16','shooting',40,'Free-throw volume')],
  },
  {
    _id: 'b30', name: 'Theo Griffin',     age: 21, sport: 'basketball', team: 'Storm Falcons', position: 'PG', number: 11,
    avatar: av('Theo Griffin'),     physicalData: ph(186, 82), fitness: fit(88, 75, 92, 84),
    injury: inj('healthy'),
    training: [tr('2024-01-09','dribbling',55,'Pressure-resistance handle'), tr('2024-01-13','shooting',50,'Side-step three'), tr('2024-01-17','cardio',45,'Conditioning sprints')],
  },
  {
    _id: 'b31', name: 'Damian Cole',      age: 19, sport: 'basketball', team: 'Storm Falcons', position: 'SG', number: 12,
    avatar: av('Damian Cole'),      physicalData: ph(192, 87), fitness: fit(85, 79, 91, 81),
    injury: inj('healthy'),
    training: [tr('2024-01-07','shooting',60,'Shooting specialist'), tr('2024-01-11','strength',40,'Guard strength block'), tr('2024-01-15','speed',45,'On/off ball movement')],
  },
  {
    _id: 'b32', name: 'Preston Hart',     age: 22, sport: 'basketball', team: 'Storm Falcons', position: 'SF', number: 13,
    avatar: av('Preston Hart'),     physicalData: ph(199, 98), fitness: fit(81, 87, 86, 77),
    injury: inj('healthy'),
    training: [tr('2024-01-08','strength',55,'Wing athleticism'), tr('2024-01-12','shooting',50,'Pull-up & spot'), tr('2024-01-16','cardio',40,'Wing transition')],
  },
  {
    _id: 'b33', name: 'Calvin Shaw',      age: 20, sport: 'basketball', team: 'Storm Falcons', position: 'PF', number: 14,
    avatar: av('Calvin Shaw'),      physicalData: ph(204, 108), fitness: fit(78, 90, 80, 72),
    injury: inj('recovering', 'Lower back muscle spasm, 75% recovered, cautious contact training'),
    training: [tr('2024-01-09','flexibility',50,'Lower back protocol'), tr('2024-01-13','cardio',30,'No-contact light run'), tr('2024-01-17','strength',35,'Core-only rehab')],
  },
  {
    _id: 'b34', name: 'Warren Ross',      age: 21, sport: 'basketball', team: 'Storm Falcons', position: 'C', number: 15,
    avatar: av('Warren Ross'),      physicalData: ph(211, 118), fitness: fit(72, 92, 70, 66),
    injury: inj('healthy'),
    training: [tr('2024-01-07','strength',65,'Post presence & drop steps'), tr('2024-01-11','shooting',40,'Short-range polish'), tr('2024-01-15','cardio',30,'Controlled conditioning')],
  },
  {
    _id: 'b35', name: 'Felix Torres',     age: 19, sport: 'basketball', team: 'Storm Falcons', position: 'SG', number: 21,
    avatar: av('Felix Torres'),     physicalData: ph(191, 86), fitness: fit(86, 80, 91, 81),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',65,'Off-movement shooting'), tr('2024-01-12','dribbling',45,'Rhythm dribble sets'), tr('2024-01-16','cardio',40,'Conditioning ladder')],
  },
  {
    _id: 'b36', name: 'Graham West',      age: 20, sport: 'basketball', team: 'Storm Falcons', position: 'SF', number: 22,
    avatar: av('Graham West'),      physicalData: ph(200, 100), fitness: fit(82, 85, 87, 78),
    injury: inj('healthy'),
    training: [tr('2024-01-09','shooting',55,'Versatile forward drills'), tr('2024-01-13','strength',50,'Multi-position strength'), tr('2024-01-17','speed',40,'Transition sprinting')],
  },

  // ══════════ 🏈  IRON TITANS ══════════
  {
    _id: 'f01', name: 'Ryan Mitchell',    age: 21, sport: 'football', team: 'Iron Titans', position: 'QB', number: 12,
    avatar: av('Ryan Mitchell'),    physicalData: ph(190, 95), fitness: fit(82, 85, 88, 79),
    injury: inj('healthy'),
    training: [tr('2024-01-07','tactical',70,'Film study & pocket drill'), tr('2024-01-11','speed',45,'Scramble drill'), tr('2024-01-15','strength',50,'Arm & shoulder')],
  },
  {
    _id: 'f02', name: 'Marcus Fuller',    age: 20, sport: 'football', team: 'Iron Titans', position: 'RB', number: 21,
    avatar: av('Marcus Fuller'),    physicalData: ph(183, 95), fitness: fit(85, 90, 92, 76),
    injury: inj('healthy'),
    training: [tr('2024-01-08','speed',50,'Gap reads & burst'), tr('2024-01-12','strength',60,'Lower body power'), tr('2024-01-16','cardio',40,'Conditioning circuit')],
  },
  {
    _id: 'f03', name: 'Jason Rhodes',     age: 19, sport: 'football', team: 'Iron Titans', position: 'WR', number: 81,
    avatar: av('Jason Rhodes'),     physicalData: ph(185, 84), fitness: fit(86, 78, 95, 82),
    injury: inj('healthy'),
    training: [tr('2024-01-07','speed',55,'Route running precise'), tr('2024-01-11','shooting',40,'Catch under pressure'), tr('2024-01-15','cardio',45,'Deep route sprints')],
  },
  {
    _id: 'f04', name: 'Kyle Warren',      age: 22, sport: 'football', team: 'Iron Titans', position: 'WR', number: 82,
    avatar: av('Kyle Warren'),      physicalData: ph(188, 87), fitness: fit(84, 80, 93, 80),
    injury: inj('minor', 'Mild right hamstring strain, training at reduced intensity'),
    training: [tr('2024-01-08','flexibility',45,'Hamstring recovery'), tr('2024-01-12','speed',30,'Reduced sprint'), tr('2024-01-16','shooting',40,'Stationary catch drills')],
  },
  {
    _id: 'f05', name: 'Tyler Cross',      age: 21, sport: 'football', team: 'Iron Titans', position: 'TE', number: 87,
    avatar: av('Tyler Cross'),      physicalData: ph(195, 110), fitness: fit(80, 88, 82, 72),
    injury: inj('healthy'),
    training: [tr('2024-01-09','strength',60,'TE inline block work'), tr('2024-01-13','speed',40,'Seam route running'), tr('2024-01-17','cardio',40,'Conditioning')],
  },
  {
    _id: 'f06', name: 'Brandon Hill',     age: 22, sport: 'football', team: 'Iron Titans', position: 'OL', number: 76,
    avatar: av('Brandon Hill'),     physicalData: ph(193, 130), fitness: fit(72, 96, 70, 63),
    injury: inj('healthy'),
    training: [tr('2024-01-07','blocking',65,'Pass protection sets'), tr('2024-01-11','strength',70,'Power rack & sled'), tr('2024-01-15','cardio',30,'OL conditioning')],
  },
  {
    _id: 'f07', name: 'Derek Hayes',      age: 20, sport: 'football', team: 'Iron Titans', position: 'DL', number: 91,
    avatar: av('Derek Hayes'),      physicalData: ph(191, 122), fitness: fit(75, 94, 78, 64),
    injury: inj('recovering', 'Neck muscle strain, wearing cervical collar, expected 3-week recovery'),
    training: [tr('2024-01-08','flexibility',40,'Neck & shoulder mobility'), tr('2024-01-12','strength',45,'No-contact lower body'), tr('2024-01-16','cardio',25,'Stationary bike')],
  },
  {
    _id: 'f08', name: 'Connor Walsh',     age: 21, sport: 'football', team: 'Iron Titans', position: 'LB', number: 54,
    avatar: av('Connor Walsh'),     physicalData: ph(188, 108), fitness: fit(83, 91, 84, 72),
    injury: inj('healthy'),
    training: [tr('2024-01-09','tactical',60,'Coverage reads & blitz'), tr('2024-01-13','strength',60,'LB power block'), tr('2024-01-17','speed',45,'Pass-rush footwork')],
  },
  {
    _id: 'f09', name: 'Nathan Pierce',    age: 19, sport: 'football', team: 'Iron Titans', position: 'CB', number: 23,
    avatar: av('Nathan Pierce'),    physicalData: ph(181, 84), fitness: fit(86, 80, 92, 82),
    injury: inj('healthy'),
    training: [tr('2024-01-07','speed',55,'Press & bail technique'), tr('2024-01-11','tactical',50,'Zone coverage reads'), tr('2024-01-15','cardio',45,'Track conditioning')],
  },
  {
    _id: 'f10', name: 'Kyle Adams',       age: 22, sport: 'football', team: 'Iron Titans', position: 'S', number: 33,
    avatar: av('Kyle Adams'),       physicalData: ph(185, 92), fitness: fit(87, 84, 89, 78),
    injury: inj('healthy'),
    training: [tr('2024-01-08','tactical',60,'Deep coverage angles'), tr('2024-01-12','strength',50,'Safety athletic block'), tr('2024-01-16','speed',45,'Break on ball drills')],
  },
  {
    _id: 'f11', name: 'Trevor Cole',      age: 20, sport: 'football', team: 'Iron Titans', position: 'K', number: 4,
    avatar: av('Trevor Cole'),      physicalData: ph(180, 80), fitness: fit(72, 74, 78, 80),
    injury: inj('healthy'),
    training: [tr('2024-01-09','shooting',60,'Field goal consistency'), tr('2024-01-13','flexibility',40,'Hip flexor mobility'), tr('2024-01-17','cardio',30,'Warm-up routine')],
  },

  // ══════════ 🏈  STEEL PANTHERS ══════════
  {
    _id: 'f12', name: 'Alex Hunter',      age: 22, sport: 'football', team: 'Steel Panthers', position: 'QB', number: 12,
    avatar: av('Alex Hunter'),      physicalData: ph(192, 97), fitness: fit(80, 86, 87, 78),
    injury: inj('healthy'),
    training: [tr('2024-01-07','tactical',70,'Pre-snap reads'), tr('2024-01-11','speed',45,'Rollout boot drills'), tr('2024-01-15','strength',50,'Core & shoulder')],
  },
  {
    _id: 'f13', name: 'Devon King',       age: 20, sport: 'football', team: 'Steel Panthers', position: 'RB', number: 28,
    avatar: av('Devon King'),       physicalData: ph(180, 93), fitness: fit(87, 91, 93, 75),
    injury: inj('healthy'),
    training: [tr('2024-01-08','speed',55,'One-cut burst'), tr('2024-01-12','strength',65,'Power clean & squat'), tr('2024-01-16','cardio',40,'RB conditioning')],
  },
  {
    _id: 'f14', name: 'Marcus Webb',      age: 21, sport: 'football', team: 'Steel Panthers', position: 'WR', number: 84,
    avatar: av('Marcus Webb'),      physicalData: ph(187, 85), fitness: fit(85, 79, 94, 82),
    injury: inj('healthy'),
    training: [tr('2024-01-09','speed',55,'Route running sharp'), tr('2024-01-13','shooting',45,'RAC after catch'), tr('2024-01-17','cardio',40,'Deep route conditioning')],
  },
  {
    _id: 'f15', name: 'Corey Lane',       age: 19, sport: 'football', team: 'Steel Panthers', position: 'WR', number: 85,
    avatar: av('Corey Lane'),       physicalData: ph(183, 82), fitness: fit(87, 77, 95, 84),
    injury: inj('healthy'),
    training: [tr('2024-01-07','speed',55,'Slot receiver footwork'), tr('2024-01-11','shooting',50,'Catch in traffic'), tr('2024-01-15','cardio',40,'Explosive route work')],
  },
  {
    _id: 'f16', name: 'Austin Bell',      age: 22, sport: 'football', team: 'Steel Panthers', position: 'TE', number: 88,
    avatar: av('Austin Bell'),      physicalData: ph(196, 112), fitness: fit(79, 89, 81, 71),
    injury: inj('minor', 'Right elbow contusion, bandaged, contact training restricted'),
    training: [tr('2024-01-08','flexibility',40,'Elbow recovery'), tr('2024-01-12','cardio',40,'No-contact conditioning'), tr('2024-01-16','tactical',50,'Film session & route walk')],
  },
  {
    _id: 'f17', name: 'Logan Pierce',     age: 20, sport: 'football', team: 'Steel Panthers', position: 'OL', number: 77,
    avatar: av('Logan Pierce'),     physicalData: ph(195, 128), fitness: fit(71, 95, 68, 62),
    injury: inj('healthy'),
    training: [tr('2024-01-09','blocking',65,'Zone blocking scheme'), tr('2024-01-13','strength',70,'Heavy sled work'), tr('2024-01-17','cardio',30,'Short burst conditioning')],
  },
  {
    _id: 'f18', name: 'Zach Porter',      age: 21, sport: 'football', team: 'Steel Panthers', position: 'DL', number: 93,
    avatar: av('Zach Porter'),      physicalData: ph(193, 124), fitness: fit(74, 95, 77, 63),
    injury: inj('healthy'),
    training: [tr('2024-01-07','blocking',60,'Pass-rush techniques'), tr('2024-01-11','strength',70,'Power explosion'), tr('2024-01-15','speed',40,'First-step quickness')],
  },
  {
    _id: 'f19', name: 'Chase Burns',      age: 22, sport: 'football', team: 'Steel Panthers', position: 'LB', number: 51,
    avatar: av('Chase Burns'),      physicalData: ph(189, 107), fitness: fit(84, 92, 85, 71),
    injury: inj('healthy'),
    training: [tr('2024-01-08','tactical',60,'Block-shed & pursuit'), tr('2024-01-12','strength',65,'Linebacker strength'), tr('2024-01-16','speed',45,'Pursuit angle drills')],
  },
  {
    _id: 'f20', name: 'Blake Newton',     age: 19, sport: 'football', team: 'Steel Panthers', position: 'CB', number: 24,
    avatar: av('Blake Newton'),     physicalData: ph(180, 83), fitness: fit(87, 81, 93, 83),
    injury: inj('recovering', 'Shoulder dislocation reduced, contact training prohibited, expected return in 4 weeks'),
    training: [tr('2024-01-09','flexibility',50,'Shoulder ROM exercises'), tr('2024-01-13','cardio',35,'Lower body only conditioning'), tr('2024-01-17','tactical',45,'Film study — no contact')],
  },
  {
    _id: 'f21', name: 'Shane Owens',      age: 21, sport: 'football', team: 'Steel Panthers', position: 'S', number: 36,
    avatar: av('Shane Owens'),      physicalData: ph(186, 93), fitness: fit(86, 83, 88, 78),
    injury: inj('healthy'),
    training: [tr('2024-01-07','tactical',60,'Safety coverage shell'), tr('2024-01-11','strength',50,'Athletic safety block'), tr('2024-01-15','speed',45,'Run support angles')],
  },
  {
    _id: 'f22', name: 'Derek Wells',      age: 20, sport: 'football', team: 'Steel Panthers', position: 'K', number: 7,
    avatar: av('Derek Wells'),      physicalData: ph(178, 78), fitness: fit(71, 75, 77, 81),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',60,'Long FG distance work'), tr('2024-01-12','flexibility',40,'Kicking hip mobility'), tr('2024-01-16','cardio',30,'Kicker conditioning')],
  },

  // ══════════ 🏈  DIAMOND KNIGHTS ══════════
  {
    _id: 'f23', name: 'Jake Reynolds',    age: 21, sport: 'football', team: 'Diamond Knights', position: 'QB', number: 10,
    avatar: av('Jake Reynolds'),    physicalData: ph(191, 96), fitness: fit(81, 85, 88, 79),
    injury: inj('healthy'),
    training: [tr('2024-01-07','tactical',70,'RPO decision-making'), tr('2024-01-11','speed',45,'Escape scramble drills'), tr('2024-01-15','strength',50,'Core rotation')],
  },
  {
    _id: 'f24', name: 'Tyson Hall',       age: 22, sport: 'football', team: 'Diamond Knights', position: 'RB', number: 22,
    avatar: av('Tyson Hall'),       physicalData: ph(182, 97), fitness: fit(86, 92, 91, 74),
    injury: inj('healthy'),
    training: [tr('2024-01-08','speed',55,'Between-the-tackles vision'), tr('2024-01-12','strength',65,'Leg power rack'), tr('2024-01-16','cardio',40,'Running back conditioning')],
  },
  {
    _id: 'f25', name: 'Camden Ross',      age: 19, sport: 'football', team: 'Diamond Knights', position: 'WR', number: 80,
    avatar: av('Camden Ross'),      physicalData: ph(184, 83), fitness: fit(88, 78, 95, 83),
    injury: inj('healthy'),
    training: [tr('2024-01-09','speed',55,'Stem routes & release'), tr('2024-01-13','shooting',50,'Back-shoulder catch'), tr('2024-01-17','cardio',40,'Deep threat conditioning')],
  },
  {
    _id: 'f26', name: 'Eli Marsh',        age: 20, sport: 'football', team: 'Diamond Knights', position: 'WR', number: 83,
    avatar: av('Eli Marsh'),        physicalData: ph(181, 80), fitness: fit(86, 77, 93, 83),
    injury: inj('minor', 'Mild thigh muscle strain, reduced training load this week'),
    training: [tr('2024-01-07','flexibility',45,'Thigh flexibility'), tr('2024-01-11','shooting',40,'Low-impact route walk'), tr('2024-01-15','cardio',25,'Stationary bike')],
  },
  {
    _id: 'f27', name: 'Nolan Price',      age: 21, sport: 'football', team: 'Diamond Knights', position: 'TE', number: 89,
    avatar: av('Nolan Price'),      physicalData: ph(197, 113), fitness: fit(78, 88, 80, 71),
    injury: inj('healthy'),
    training: [tr('2024-01-08','blocking',60,'Y-receiver routes'), tr('2024-01-12','strength',60,'Tight end versatility'), tr('2024-01-16','speed',40,'Red-zone seam')],
  },
  {
    _id: 'f28', name: 'Owen Bradley',     age: 22, sport: 'football', team: 'Diamond Knights', position: 'OL', number: 75,
    avatar: av('Owen Bradley'),     physicalData: ph(194, 129), fitness: fit(70, 96, 67, 62),
    injury: inj('healthy'),
    training: [tr('2024-01-09','blocking',65,'Gap scheme footwork'), tr('2024-01-13','strength',70,'Power sled series'), tr('2024-01-17','cardio',30,'OL burst conditioning')],
  },
  {
    _id: 'f29', name: 'Hunter Grant',     age: 20, sport: 'football', team: 'Diamond Knights', position: 'DL', number: 94,
    avatar: av('Hunter Grant'),     physicalData: ph(192, 123), fitness: fit(76, 94, 78, 64),
    injury: inj('healthy'),
    training: [tr('2024-01-07','blocking',60,'Bull-rush & spin'), tr('2024-01-11','strength',70,'Explosion from stance'), tr('2024-01-15','speed',40,'First-step quickness')],
  },
  {
    _id: 'f30', name: 'Caleb Fox',        age: 21, sport: 'football', team: 'Diamond Knights', position: 'LB', number: 55,
    avatar: av('Caleb Fox'),        physicalData: ph(187, 106), fitness: fit(84, 91, 85, 72),
    injury: inj('injured', 'Knee meniscus tear, post-surgery recovery, may miss rest of season'),
    training: [tr('2024-01-08','flexibility',40,'Post-op mobility protocol'), tr('2024-01-12','strength',30,'Upper body only'), tr('2024-01-16','cardio',20,'Pool rehabilitation')],
  },
  {
    _id: 'f31', name: 'Drew Mason',       age: 22, sport: 'football', team: 'Diamond Knights', position: 'CB', number: 26,
    avatar: av('Drew Mason'),       physicalData: ph(182, 85), fitness: fit(87, 82, 92, 83),
    injury: inj('healthy'),
    training: [tr('2024-01-09','speed',55,'Press man technique'), tr('2024-01-13','tactical',55,'Zone-to-man transition'), tr('2024-01-17','cardio',45,'DB conditioning circuit')],
  },
  {
    _id: 'f32', name: 'Mason Duke',       age: 19, sport: 'football', team: 'Diamond Knights', position: 'S', number: 41,
    avatar: av('Mason Duke'),       physicalData: ph(185, 91), fitness: fit(88, 84, 89, 79),
    injury: inj('healthy'),
    training: [tr('2024-01-07','tactical',60,'Box safety run fit'), tr('2024-01-11','strength',55,'Athletic safety strength'), tr('2024-01-15','speed',45,'Break-on-ball instincts')],
  },
  {
    _id: 'f33', name: 'Parker Stone',     age: 20, sport: 'football', team: 'Diamond Knights', position: 'K', number: 8,
    avatar: av('Parker Stone'),     physicalData: ph(179, 79), fitness: fit(70, 73, 76, 80),
    injury: inj('healthy'),
    training: [tr('2024-01-08','shooting',65,'Accuracy at 50+ yards'), tr('2024-01-12','flexibility',40,'Kicker hip rotation'), tr('2024-01-16','cardio',30,'Kicker warm-up protocol')],
  },
];

// ─── Sport-specific Metrics & Position Tags ───────────────
export const SPORT_METRICS = {
  soccer: {
    keyMetrics: ['endurance', 'speed', 'agility', 'coordination', 'stamina'],
    positionTags: {
      GK:  ['Shot Stopper', 'Aerial Command', 'Distribution'],
      CB:  ['Aerial Duels', 'Ball Playing', 'Defensive Leader'],
      LB:  ['Overlapping Runs', 'Crossing', 'Defensive Cover'],
      RB:  ['Overlapping Runs', 'Crossing', 'Defensive Cover'],
      CM:  ['Box-to-Box', 'Press Resistance', 'Distribution'],
      CAM: ['Creative Play', 'Key Passes', 'Final Third'],
      LW:  ['Pace & Dribble', 'Cut Inside', 'Chance Creation'],
      RW:  ['Pace & Dribble', 'Cut Inside', 'Chance Creation'],
      ST:  ['Clinical Finish', 'Hold-up Play', 'Movement'],
    },
  },
  basketball: {
    keyMetrics: ['speed', 'agility', 'reaction', 'coordination', 'power'],
    positionTags: {
      PG: ['Playmaker', 'Ball Handler', 'Court Vision'],
      SG: ['Perimeter Scorer', 'Off-Ball Movement', 'Shooting'],
      SF: ['Versatile', 'Two-Way Player', 'Wing Scorer'],
      PF: ['Post Play', 'Rebounding', 'Mid-Range'],
      C:  ['Paint Presence', 'Shot Blocking', 'Rim Protection'],
    },
  },
  football: {
    keyMetrics: ['strength', 'power', 'endurance', 'reaction', 'speed'],
    positionTags: {
      QB: ['Field General', 'Pocket Presence', 'Decision Maker'],
      RB: ['Elusive Runner', 'Receiving Back', 'Pass Block'],
      WR: ['Route Runner', 'Speed Threat', 'Contested Catch'],
      TE: ['Blocking TE', 'Receiving TE', 'Red Zone'],
      OL: ['Pass Protection', 'Run Blocking', 'Anchor'],
      DL: ['Pass Rusher', 'Run Stopper', 'Motor'],
      LB: ['Coverage LB', 'Blitz Package', 'Tackler'],
      CB: ['Man Coverage', 'Zone Coverage', 'Ball Hawk'],
      S:  ['Deep Safety', 'Run Support', 'Coverage'],
      K:  ['Accuracy', 'Power Kick', 'Consistency'],
    },
  },
};

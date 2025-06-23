
export interface NflTeam {
  slug: string;
  name: string;
  id365: string;
  abbreviation: string; // For fallback logo if needed
}

export const nflTeams: NflTeam[] = [
  { slug: 'arizona-cardinals', name: 'Arizona Cardinals', id365: '6677', abbreviation: 'ARI' },
  { slug: 'atlanta-falcons', name: 'Atlanta Falcons', id365: '6759', abbreviation: 'ATL' },
  { slug: 'baltimore-ravens', name: 'Baltimore Ravens', id365: '6655', abbreviation: 'BAL' },
  { slug: 'buffalo-bills', name: 'Buffalo Bills', id365: '6657', abbreviation: 'BUF' },
  { slug: 'carolina-panthers', name: 'Carolina Panthers', id365: '6678', abbreviation: 'CAR' },
  { slug: 'chicago-bears', name: 'Chicago Bears', id365: '6659', abbreviation: 'CHI' },
  { slug: 'cincinnati-bengals', name: 'Cincinnati Bengals', id365: '6762', abbreviation: 'CIN' },
  { slug: 'cleveland-browns', name: 'Cleveland Browns', id365: '6660', abbreviation: 'CLE' },
  { slug: 'dallas-cowboys', name: 'Dallas Cowboys', id365: '6661', abbreviation: 'DAL' },
  { slug: 'denver-broncos', name: 'Denver Broncos', id365: '6656', abbreviation: 'DEN' },
  { slug: 'detroit-lions', name: 'Detroit Lions', id365: '6663', abbreviation: 'DET' },
  { slug: 'green-bay-packers', name: 'Green Bay Packers', id365: '6679', abbreviation: 'GB' },
  { slug: 'houston-texans', name: 'Houston Texans', id365: '6658', abbreviation: 'HOU' },
  { slug: 'indianapolis-colts', name: 'Indianapolis Colts', id365: '6664', abbreviation: 'IND' },
  { slug: 'jacksonville-jaguars', name: 'Jacksonville Jaguars', id365: '6676', abbreviation: 'JAX' },
  { slug: 'kansas-city-chiefs', name: 'Kansas City Chiefs', id365: '6764', abbreviation: 'KC' },
  { slug: 'las-vegas-raiders', name: 'Las Vegas Raiders', id365: '6674', abbreviation: 'LV' },
  { slug: 'los-angeles-chargers', name: 'Los Angeles Chargers', id365: '6673', abbreviation: 'LAC' },
  { slug: 'los-angeles-rams', name: 'Los Angeles Rams', id365: '6669', abbreviation: 'LAR' },
  { slug: 'miami-dolphins', name: 'Miami Dolphins', id365: '6666', abbreviation: 'MIA' },
  { slug: 'minnesota-vikings', name: 'Minnesota Vikings', id365: '6680', abbreviation: 'MIN' },
  { slug: 'new-england-patriots', name: 'New England Patriots', id365: '6765', abbreviation: 'NE' },
  { slug: 'new-orleans-saints', name: 'New Orleans Saints', id365: '6763', abbreviation: 'NO' },
  { slug: 'new-york-giants', name: 'New York Giants', id365: '6672', abbreviation: 'NYG' },
  { slug: 'new-york-jets', name: 'New York Jets', id365: '6665', abbreviation: 'NYJ' },
  { slug: 'philadelphia-eagles', name: 'Philadelphia Eagles', id365: '6671', abbreviation: 'PHI' },
  { slug: 'pittsburgh-steelers', name: 'Pittsburgh Steelers', id365: '6761', abbreviation: 'PIT' },
  { slug: 'san-francisco-49ers', name: 'San Francisco 49ers', id365: '6670', abbreviation: 'SF' },
  { slug: 'seattle-seahawks', name: 'Seattle Seahawks', id365: '6662', abbreviation: 'SEA' },
  { slug: 'tampa-bay-buccaneers', name: 'Tampa Bay Buccaneers', id365: '6760', abbreviation: 'TB' },
  { slug: 'tennessee-titans', name: 'Tennessee Titans', id365: '6675', abbreviation: 'TEN' },
  { slug: 'washington-commanders', name: 'Washington Commanders', id365: '6758', abbreviation: 'WAS' },
];

export function getNflTeamBySlug(slug: string): NflTeam | undefined {
  return nflTeams.find(team => team.slug === slug);
}

export function getNflTeamById365(id365: string): NflTeam | undefined {
  return nflTeams.find(team => team.id365 === id365);
}

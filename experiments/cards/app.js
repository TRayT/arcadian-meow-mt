const crazyFaces = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Draw", "Reverse", "Skip", "Wild"];

const suits = [
	"Heart", "Diamond", //Red
	"Club", "Spade",    //Blue\Black
	"Moon", "Star",     //Yellow\White
	"Bell", "Shield"    //Green
];

const buildDeck = (faces, suits) => {
	let set = suits.reduce((deck, suit) => {
		return deck.concat(faces.map(face => [face, suit]));
	}, []);

	//Using a for loop because this can't run async
	for(let i = 0; i < set.length; i++) {
		let r = Math.floor(Math.random() * set.length);
		[set[i], set[r]] = [set[r], set[i]];
	}

	return set;
}

const setupCrazy = (deck, players) => {
	for(let i = 0; i < 7; i++) {
		players.forEach(player => {
			player.hand[i] = deck.shift();
		});
	}

	return {
		draw: deck,
		discard: [deck.shift()],
		players: players
	};
}

console.log(setupCrazy(buildDeck(crazyFaces, suits), [
	{hand: []}, {hand:[]}, {hand:[]}, {hand:[]}
]));

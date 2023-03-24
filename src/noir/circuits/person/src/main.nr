use dep::std;


struct Individual {
    name: str<20>,
    genetic: [Snp; 5],
}

// AT=0, TA=1, GC=2, CA=3
struct Snp {
    position: u32,
    value: u8,
}


//
//  Circuit that determines board validity for a Battleship Game
//
//  Input:
//      hash { pub Field } - Pedersen hash computed outside of circuit that represents board state
//      ships { [Field: 15] } - Array that represents ship coordinates
//
fn main(hash: pub Field, ships: [Field; 15]) {
    // Lengths of all ships
    let lengths: [u4; 5] = [5, 4, 3, 3, 2];
    // Check ship ranges
    for i in 0..5 {
     check_ship_ranges(lengths[i], ships[i*3] as u4, ships[i*3+1] as u4, ships[i*3+2] as u4);
    };
    // Ensure ships have valid placement and do not share coordinates with each other
    check_for_collision(lengths, ships);
    // Check integrity of ship hash
    let computed_hash = std::hash::pedersen(ships);
    constrain hash == computed_hash[0];
}
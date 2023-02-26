Quantum Tamagotchi - Visualization of unitary matrix with color
 
This project visualizes Unitary matrix of circuit as colored square, which can be seen with index.html.
Originally, I made this 'art' as NFT in fxhash(*) as qma0000, but was only able to sold a single copy and the smart contract was deprecated. 

Since coefficients of unitary matrix represents amplitude and phase, I visualized coefficients as colored square,
where area of the square represents amplitude, and the color of square represents phase, by the color is painted as HSB color which hue is π + arg(coefficient). for example, coefficient of 1 will be cyan, and coefficient of -1 will be red.

In this project, circuits are consists with 8 layers, where first layer is made of Rx,Ry,Rz rotation gate which rotates over time. other 7 layer might contain PauliX,Y,Z, Pauli Rx,Ry,Rz, Controlled Rx,Ry,Rz, S,S+,T,T+, CNOT and SWAP gate.
The circuit can be shown with press any key except 'spacebar', 'r' and 's' key.(**)

Notable stuff in this circuit representation is the rotation angle of Pauli rotation gate is represented with the position of small circle around the gate. (To visualize angle without showing number)

It would be good to know that the project will show different random circuit and its unitary matrix on refresh, and most of project is written in index.js.

(*) This NFT marketplace deals with NFT generated with algorithms and implemented with javascript.
link: https://www.fxhash.xyz/generative/slug/quantum-tamagotchi

(**) space bar pause/unpauses the project, 'r' resets time, and 's' screenshots the project.
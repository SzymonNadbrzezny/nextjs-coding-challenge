## Realtime
Biggest decision by far. I have not worked with realtime API that much yet, but I've chosen websockets. It requires modyfing server, due to this it's not suitable to all deployement enviroments (Vercel doesn't work with ws).

Here instead live progress (for example current word) I decided to use streak. It shows how many sentences users have done without error, which I think will make it a little bit more compepetitve.

## Storage of test/user data
We need to store test and user data, but also not require user to repeat it withing the same browser session.
For server-side storage I decided to use AI to create in-memory storage. While the server is running it'll have 1 leaderboard.
For client-side data I used zustand with persiting stores that save data to `sessionStorage`. We only need to save username and userId here.

## Game logic
The game requires timer, list of predefined sentences and error-checking.
To save on time I used AI for basic timer and error detection and modified results to my satisfaction. Added streak logic, round logic 

We need to keep track of the time user has left, their typed words and their score.

Game playes in rounds. Each round is 1 sentence and lasts predefined time (10s by default). After ending the round there's 5 seconds before new rounds start.

Players can stop playing at any point, but once they resume they'll loose their statistics ( wpm, accuracy and streak).

# Testing

I used playwright to test storage and game logic.
Those are not full tests, but they do work. I did however realize I need to spend more time writing tests since I'm out of practice and it took me way longer than it should.
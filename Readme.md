# PlayPulse

PlayPulse is a video streaming app where users can upload and publish videos. This is a Node.js application built on Express, using MongoDB as the database, and Cloudinary and Multer for video uploading and storage.

## Key Features

- User authentication
- Video uploading
- Video publishing
- Watch and comment on other users' videos
- Create channels and subscribe to others
- Create personal playlists
- Like comments, videos, and tweets
- Upload tweets

## How to Run the Application

1. Clone the project from the repository.
2. Create a `.env` file. Copy all the environment variables from `.env.sample`.
3. Fill in the variables with relevant information.
4. Run `npm i` to install the node modules.
5. Run `npm run dev` to start the project.

## APIs and Routes

### HealthCheck

`"api/v1/healthcheck"`

1. `/` - GET: Checks the server state.

### Dashboard

`"api/v1/dashboard"`

1. `/stats` - GET: Retrieves channel stats such as total video views, total videos, total likes, and total subscribers.
2. `/videos` - GET: Retrieves channel videos.

### User

`"api/v1/users"`

1. `/register` - POST: Registers a user.
2. `/login` - POST: Logs in a user.
3. `/logout` - POST: Logs out a user.
4. `/refresh-token` - POST: Generates an access token and refresh token.
5. `/change-password` - POST: Changes the user's password.
6. `/current-user` - GET: Returns the currently authenticated user.
7. `/update-account` - PATCH: Updates account details.
8. `/update-avatar` - PATCH: Updates the user profile photo.
9. `/update-cover-image` - PATCH: Updates the cover image of the channel or user account.
10. `/c/:username` - GET: Retrieves a user's channel profile.
11. `/history` - GET: Returns the user's watch history.

### Video

`"api/v1/videos"`

1. `/` - GET: Retrieves all videos of any user.
2. `/` - POST: Publishes and uploads a video to Cloudinary.
3. `/:videoId` - GET: Retrieves a video by ID.
4. `/:videoId` - PATCH: Updates a video by ID.
5. `/:videoId` - DELETE: Deletes a video by ID.
6. `/update-thumbnail/:videoId` - PATCH: Updates the video thumbnail.
7. `/toggle/publish/:videoId` - PATCH: Toggles the publish status of a video.

### Comment

`"api/v1/comments"`

1. `/:videoId` - GET: Retrieves comments of a video.
2. `/:videoId` - POST: Adds a comment to a video.
3. `/c/:commentId` - PATCH: Updates a comment.
4. `/c/:commentId` - DELETE: Deletes a comment.

### Tweet

`"api/v1/tweets"`

1. `/` - POST: Creates a new tweet.
2. `/user/:userId` - GET: Retrieves tweets from any user.
3. `/:tweetId` - PATCH: Updates a tweet.
4. `/:tweetId` - DELETE: Deletes a tweet.

### Subscription

`"api/v1/subscriptions"`

1. `/c/:channelId` - POST: Toggles the subscription status.
2. `/c/:channelId` - GET: Retrieves a user's channel subscribers.
3. `/u/:subscribedId` - GET: Retrieves subscribed channels.

### Playlist

`"api/v1/playlist"`

1. `/` - POST: Creates a user playlist.
2. `/user/:userId` - GET: Retrieves playlists of a specific user.
3. `/:playlistId` - GET: Retrieves a playlist by ID.
4. `/:playlistId` - DELETE: Deletes a playlist by ID.
5. `/:playlistId` - PATCH: Updates a playlist by ID.
6. `/add/:videoId/:playlistId` - PATCH: Adds a video to a playlist.
7. `/remove/:videoId/:playlistId` - PATCH: Removes a video from a playlist.

### Like

`"api/v1/likes"`

1. `/toggle/v/:videoId` - POST: Toggles the like status of a video.
2. `/toggle/c/:commentId` - POST: Toggles the like status of a comment.
3. `/toggle/t/:tweetId` - POST: Toggles the like status of a tweet.
4. `/videos` - GET: Returns liked videos.

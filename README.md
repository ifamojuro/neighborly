# Neighborly Prototype

Neighborly is a platform idea for helping residents shape what happens in their own neighborhood.

Most neighborhoods are served by many separate nonprofits and community groups. Each one focuses on something different, such as parks, housing or food. For residents, it's often hard to know which group to talk to, or to see what's already being done. Neighborly aims to be one shared place where:

- **Residents** can raise issues on their block, see what neighbors have already reported, and join in on fixing them.
- **Local organizations** can see what residents care about, coordinate with each other, and keep the neighborhood updated on their progress.

The bigger goal is to support *deliberative democracy*: neighbors and the groups that serve them working through local problems together, out in the open.

This folder holds a **clickable prototype** of the app: a mockup you can tap through to see how it would look and feel. It isn't the real app. It uses made-up sample data and isn't connected to any server, so nothing you type or click gets saved or sent anywhere. Click around freely.

## Live Demo

You can view the live prototype directly in your browser via GitHub Pages:
👉 **[Launch Neighborly Prototype](https://dlc-17.github.io/neighborly/)**


## What's in this folder

| File | What it is |
| --- | --- |
| `Neighborly Prototype.html` | The original clickable prototype. Packed into one file. |
| `client/` | Fullstack web & mobile frontend (React 18, Vite, Tailwind CSS, Leaflet, Capacitor). |
| `server/` | Fullstack backend API & WebSockets (Node.js, Express, Socket.io, Haversine geospatial engine). |
| `shared/` | Shared TypeScript domain models and schemas. |
| `README.md` | This guide. |

## Running the Fullstack Application

To run the live fullstack web application locally:

```bash
# 1. Install dependencies across workspaces
npm install

# 2. Run the integration test suite
npm test

# 3. Start both the backend API server and frontend client
npm run dev
```

- Frontend Web App: `http://localhost:5173`
- Backend API & WebSockets: `http://localhost:3001`

## How to open the prototype

You don't need to install anything. Any web browser will do: Chrome, Safari, Edge or Firefox.

1. **Download the file** `Neighborly Prototype.html` to your computer.
   - On GitHub: click the file name, then click the **download** button (a downward arrow, near the top right of the file view).
   - If you got the whole folder as a `.zip` file, double-click the zip to unpack it first.
2. **Double-click** `Neighborly Prototype.html`. It opens in your web browser.
3. You may see "Unpacking..." in the corner for a second or two while it loads. That's normal.

### If it doesn't open in a browser

- **It opened in a text editor and shows a wall of code:** close that window. Right-click the file (on a Mac, you can also Control-click), choose **Open With**, and pick your browser.
- **The page stays blank:** try a different browser, such as Chrome. The prototype also needs JavaScript turned on, which it is by default in every browser.
- **On a phone:** the prototype is best viewed on a computer. Phones often won't open downloaded HTML files.

## What to try

The prototype is laid out like a phone app. Things to explore:

- **Home:** a feed and map of issues and events in the neighborhood.
- **Calendar:** upcoming neighborhood events, such as fix-it days you can RSVP to.
- **Report an issue:** the step-by-step flow for reporting a problem. You pick the spot on the map, check whether someone already reported it, describe it, and choose which local group could help.
- **Issue details:** see who's working on a problem, follow updates, or volunteer to help.
- **"View as" switch:** see the app as a regular neighbor or as an organization. Organizations get extra tools, such as a private chat and task list.

The dates and names in the prototype (for example, "March 2026" and "Green Elm") are sample data.

# FAQ

## General Questions

### What is Wocon?

Wocon is a travel-focused social application that helps users find like-minded travel companions and discover unique travel destinations. Our goal is to provide a one-of-a-kind solution for travelers planning their next adventure.

### How is Wocon different from other travel apps?

Wocon focuses specifically on connecting travelers with compatible companions, while also offering a unique destination discovery feature that randomly selects popular travel spots with Google Earth-style animations.

### Is Wocon free to use?

Yes, Wocon is completely free to use. We may introduce premium features in the future, but the core functionality will always remain free.

## Technical Questions

### What technologies does Wocon use?

- **Frontend**: Vue 3, TypeScript, Leaflet.js
- **Backend**: Supabase (PostgreSQL database, authentication)
- **Deployment**: Cloudflare Pages
- **Development Tools**: VS Code, Trae, GitHub, TablePlus

### Do I need a Supabase account to use Wocon?

Yes, Wocon requires a Supabase account for backend services like user authentication and data storage. You can create a free Supabase account at [supabase.com](https://supabase.com).

### What browsers does Wocon support?

Wocon supports the latest versions of:
- Chrome
- Firefox
- Safari
- Edge

### Is Wocon mobile-friendly?

Yes, Wocon is fully responsive and optimized for mobile devices. The interface adjusts automatically to different screen sizes.

## Features

### How does the Discover feature work?

1. Click the "Discover" icon in the sidebar
2. Wocon randomly selects a popular travel destination from our curated database
3. The map smoothly animates to the new location with Google Earth-style transitions
4. A notification appears showing the destination name and country
5. The notification fades automatically after 1.5 seconds

### How accurate is the location feature?

Wocon uses your browser's Geolocation API, which typically provides accuracy within a few meters when using GPS (on mobile devices) and within a few hundred meters when using Wi-Fi triangulation (on desktop).

### Can I save my favorite destinations?

Yes, you can save favorite destinations by creating a trip and adding markers to the map. You can then share these trips with friends or potential travel companions.

### How does travel companion matching work?

Wocon matches users based on:
- Shared travel interests
- Destination preferences
- Travel availability
- Compatibility scores

You can view potential matches in the Connections panel.

## Troubleshooting

### Why can't I access my location?

Location access issues are typically caused by:
1. **Browser permissions**: Your browser may be blocking location access
2. **Device settings**: Location services may be disabled on your device
3. **Network issues**: Poor GPS signal or Wi-Fi connection

To fix this:
1. Check your browser's location permission settings
2. Ensure location services are enabled on your device
3. Try moving to an area with better signal

### Why isn't the Discover feature working?

Discover feature issues may be caused by:
1. **Network connection**: Poor internet connection
2. **Database issues**: Supabase database connection problems
3. **Browser compatibility**: Outdated browser

To fix this:
1. Check your internet connection
2. Refresh the page
3. Try using a different browser

### Why is the map not loading properly?

Map loading issues may be caused by:
1. **Slow internet connection**: Leaflet.js tiles not loading
2. **Browser extensions**: Ad blockers or privacy extensions blocking map tiles
3. **Leaflet.js errors**: JavaScript errors in the map library

To fix this:
1. Check your internet connection speed
2. Disable any browser extensions that might be blocking maps
3. Clear your browser cache and refresh the page

### Why can't I sign in with my OAuth provider?

OAuth sign-in issues may be caused by:
1. **Provider configuration**: Incorrect OAuth settings in Supabase
2. **Redirect URI mismatch**: Mismatched redirect URIs between Supabase and the OAuth provider
3. **Network issues**: Connection problems with the OAuth provider

To fix this:
1. Check your Supabase OAuth configuration
2. Ensure redirect URIs match exactly
3. Try again later if it's a temporary network issue

## Privacy and Security

### How does Wocon handle my personal data?

Wocon takes privacy seriously:
- **Data storage**: User data is stored securely in Supabase
- **Encryption**: All data is encrypted in transit using HTTPS
- **Access control**: Row-level security ensures users only access their own data
- **Data minimization**: We only collect necessary information

### Does Wocon share my data with third parties?

Wocon does not share your personal data with third parties except as required by law or when using third-party services like OAuth providers (Google, GitHub, etc.).

### How secure is my account?

Wocon uses Supabase Authentication, which provides:
- **Password hashing**: Secure storage of passwords
- **JWT tokens**: Secure session management
- **Two-factor authentication**: Optional additional security
- **Rate limiting**: Protection against brute force attacks

## Account Management

### How do I reset my password?

To reset your password:
1. Go to the sign-in page
2. Click "Forgot password?"
3. Enter your email address
4. Follow the instructions in the password reset email

### How do I delete my account?

To delete your account:
1. Go to your profile settings
2. Scroll to the bottom
3. Click "Delete Account"
4. Confirm your password
5. Click "Confirm Delete"

### Can I change my email address?

Yes, you can change your email address in your profile settings. You'll need to verify the new email address before it becomes active.

## Support

### How do I get help with Wocon?

If you need help:
1. **Read the documentation** in the `docs/` directory
2. **Check existing issues** on GitHub
3. **Ask questions** in the GitHub Discussions
4. **Contact us** through the support form in the app

### How can I report a bug?

To report a bug:
1. Go to the [GitHub repository](https://github.com/wocon-org/wocon_pages)
2. Click "Issues"
3. Click "New issue"
4. Select "Bug report"
5. Fill out the bug report template
6. Click "Submit new issue"

### How can I suggest a new feature?

To suggest a new feature:
1. Go to the [GitHub repository](https://github.com/wocon-org/wocon_pages)
2. Click "Issues"
3. Click "New issue"
4. Select "Feature request"
5. Fill out the feature request template
6. Click "Submit new issue"

## Contribution

### How can I contribute to Wocon?

To contribute to Wocon:
1. **Read the contributing guide** in `docs/contributing.md`
2. **Fork the repository** on GitHub
3. **Create a branch** for your contribution
4. **Make changes** following the project's code style
5. **Submit a pull request** with a detailed description

### What kind of contributions are welcome?

Wocon welcomes contributions including:
- **Bug fixes**
- **New features**
- **Documentation improvements**
- **Performance optimizations**
- **UI/UX enhancements**

### Do I need to follow any coding standards?

Yes, contributors should follow:
- **TypeScript** best practices
- **Vue 3 Composition API** for new components
- **MD3 Design System** for UI elements
- **Conventional commit messages**
- **Code linting** and **type checking**

## Deployment

### How do I deploy my own instance of Wocon?

To deploy your own Wocon instance:
1. **Clone the repository**
2. **Set up a Supabase project**
3. **Configure environment variables**
4. **Build the project**
5. **Deploy to Cloudflare Pages** or your preferred hosting provider

Detailed instructions are available in `docs/deployment.md`.

### Can I deploy Wocon to other platforms besides Cloudflare Pages?

Yes, Wocon can be deployed to any static hosting provider that supports:
- **Node.js build process**
- **Environment variables**
- **HTTPS**

Popular alternatives include Vercel, Netlify, and GitHub Pages.

### How much does it cost to deploy Wocon?

Wocon can be deployed for free using:
- **Supabase Free Tier**: Up to 50,000 API calls and 1GB database
- **Cloudflare Pages Free Tier**: Unlimited sites and bandwidth

Costs may increase with higher usage or additional features.
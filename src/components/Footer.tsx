import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import pghSkyline from '../assets/pgh_skyline.png';

const pittsburghTaglines = [
  'Made in Pittsburgh. Deployed Everywhere.',
  'Built in the 412.',
  'PGH Built. Internet Ready.',
  'Crafted in Pittsburgh, Shipped to the Cloud.',
  'Forged in the Steel City, Powered by Wi-Fi.',
  'From the Three Rivers to Your Browser.',
  'Yinzer-Built, Pixel-Perfect.',
  'Pittsburgh Made. Beta-Tested.',
  'Made in PGH — No Bugs, Just Bridges.',
  'Steel City Code, Worldwide Mode.',
  '412 Crafted. API Attached.',
  'Three Rivers, Zero Downtime.',
  'Steel City Stack.',
  'Bridges, Tunnels, and TypeScript.',
  'Yinzer Code, Cloud-Approved.',
  'From Squirrel Hill to Server Hill.',
  'Hot Metal Pipeline. Hot Reload Code.',
  "Compiled in the 'Burgh.",
  'Shipped from the Strip District.',
  'Compiled at the Cathedral.',
  'From the Point to Production.',
  'Mount Washington Views. Mountain View Speeds.',
  'South Side Source. North Side Nodes.',
  'Glenshaw Garage. Worldwide Ship.',
  'Yinzer-Built, Bracket-Tested.',
  'From the Mon to the Mat.',
  'PGH Tough. Pin-Perfect.',
  'Three Rivers. Six Minutes.',
  'Bridges Above. Brackets Below.',
  'From the 412 to the Centerline.',
  'Shaler Strong. Bracket-Tested.',
  'Steel City Sweat. Pixel-Perfect Code.',
  'Forged on the Mon, Sharpened on the Mat.',
  'Three Rivers. One Codebase.',
  'Pittsburgh Grit. Production Ready.',
  'Built Like a Wrestler. Tested Like an Engineer.',
  'Mat Tested. Production Approved.',
  'Pinning Bugs Since Day One.',
  'Western PA Wired Different.',
  'Grit Over Glamour.',
  'Steel City Tough. Championship Ready.',
  'Wrestling Built. Software Driven.',
  'Where Brackets Meet Backlogs.',
  'Managing Mats. Shipping Software.',
  'Built for Tournament Directors.',
  'From Weigh-Ins to Web Apps.',
  'Wrestling Problems. Software Solutions.',
  'Built by Wrestling People.',
  'From Brackets to Backends.',
];

export default function Footer() {
  const tagline = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * pittsburghTaglines.length);
    return pittsburghTaglines[randomIndex];
  }, []);

  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SignUpSignIn. Simple event registration and check-in.{' '}
          <span className="text-gray-400">v{__APP_VERSION__}</span>
          {' · '}
          <Link to="/privacy" className="text-gray-400 hover:text-gray-600">
            Privacy Policy
          </Link>
          {' · '}
          <Link to="/support" className="text-gray-400 hover:text-gray-600">
            Support
          </Link>
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <img src={pghSkyline} alt="Pittsburgh" className="h-4 w-auto opacity-40" />
          <span className="text-xs text-gray-400">{tagline}</span>
        </div>
      </div>
    </footer>
  );
}

import { withAuth } from '@clerk/nextjs/server';

export default withAuth((req, res, next) => {
  const { userId, session, user } = req.auth;
  const roles = user?.publicMetadata?.roles || [];

  const url = req.nextUrl.pathname;

  if (url.startsWith('/admin') && !roles.includes('admin')) {
    return Response.redirect(new URL('/', req.url));
  }
  if ((url.startsWith('/reports') || url.startsWith('/profile')) && !(roles.includes('member') || roles.includes('admin'))) {
    return Response.redirect(new URL('/sign-in', req.url));
  }
  return next();
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/reports/:path*',
    '/profile/:path*',
  ],
}; 
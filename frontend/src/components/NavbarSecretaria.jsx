import { Link, useLocation } from 'react-router-dom';

const NavbarSecretaria = () => {
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Recepción' },
    { to: '/secretarias', label: 'Secretaría' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm px-6 py-3 flex items-center gap-6">
      <span className="text-slate-800 font-black text-sm tracking-tight mr-4">DermatoMaipú</span>
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
            pathname === to
              ? 'bg-blue-600 text-white'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default NavbarSecretaria;

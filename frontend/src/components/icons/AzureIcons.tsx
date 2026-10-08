import React from 'react';

// ─── Official Azure Architecture SVG Icons ─────────────────────────────────────
// Precise vector SVGs matching Microsoft Azure Architecture Icons style guides

interface AzureIconProps {
  type?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AzureIcon: React.FC<AzureIconProps> = ({
  type = '',
  size = 24,
  className = '',
  style = {},
}) => {
  const norm = type.toLowerCase().replace(/^azurerm_/, '').replace(/-/g, '_');

  // Containers
  if (norm.includes('resource_group') || norm === 'rg') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="4" y="10" width="40" height="30" rx="4" fill="url(#rg_bg)" stroke="#0078D4" strokeWidth="2"/>
        <path d="M4 18H44" stroke="#0078D4" strokeWidth="1.5" strokeDasharray="3 2"/>
        <rect x="9" y="24" width="8" height="10" rx="2" fill="#50E6FF"/>
        <rect x="20" y="24" width="8" height="10" rx="2" fill="#0078D4"/>
        <rect x="31" y="24" width="8" height="10" rx="2" fill="#8661C5"/>
        <circle cx="10" cy="14" r="2" fill="#0078D4"/>
        <circle cx="16" cy="14" r="2" fill="#0078D4"/>
        <circle cx="22" cy="14" r="2" fill="#0078D4"/>
        <defs>
          <linearGradient id="rg_bg" x1="4" y1="10" x2="44" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EBF3FC"/>
            <stop offset="1" stopColor="#C7E0F4"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('virtual_network') || norm === 'vnet') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#vnet_grad)" />
        <circle cx="24" cy="14" r="4" fill="#FFFFFF" stroke="#0078D4" strokeWidth="1.5"/>
        <circle cx="14" cy="32" r="4" fill="#FFFFFF" stroke="#0078D4" strokeWidth="1.5"/>
        <circle cx="34" cy="32" r="4" fill="#FFFFFF" stroke="#0078D4" strokeWidth="1.5"/>
        <line x1="24" y1="18" x2="14" y2="28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="24" y1="18" x2="34" y2="28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="18" y1="32" x2="30" y2="32" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="24" cy="25" r="2.5" fill="#50E6FF"/>
        <defs>
          <linearGradient id="vnet_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#004E8C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('subnet')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#subnet_grad)"/>
        <rect x="12" y="12" width="24" height="6" rx="2" fill="#FFFFFF"/>
        <path d="M24 18V24M16 24H32M16 24V28M32 24V28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
        <rect x="11" y="28" width="10" height="8" rx="2" fill="#50E6FF"/>
        <rect x="27" y="28" width="10" height="8" rx="2" fill="#50E6FF"/>
        <defs>
          <linearGradient id="subnet_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5C2D91"/>
            <stop offset="1" stopColor="#8661C5"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Compute
  if (norm.includes('virtual_machine') || norm === 'vm' || norm.includes('linux_virtual_machine') || norm.includes('windows_virtual_machine')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="url(#vm_cube_top)" />
        <path d="M24 4L42 14L24 24L6 14L24 4Z" fill="#50E6FF" />
        <path d="M6 14L24 24V44L6 34V14Z" fill="#0078D4" />
        <path d="M42 14L24 24V44L42 34V14Z" fill="#005BA1" />
        {/* CPU circuit inlay */}
        <rect x="18" y="19" width="12" height="12" rx="2" fill="#002447" stroke="#50E6FF" strokeWidth="1.5"/>
        <circle cx="24" cy="25" r="2.5" fill="#50E6FF"/>
        <defs>
          <linearGradient id="vm_cube_top" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#004578"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('web_app') || norm.includes('app_service')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#appservice_grad)"/>
        {/* Globe & curly code brackets */}
        <circle cx="24" cy="24" r="12" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" fill="none"/>
        <path d="M19 18L14 24L19 30" stroke="#50E6FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M29 18L34 24L29 30" stroke="#50E6FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M26 17L22 31" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="appservice_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#104A7B"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('function_app') || norm.includes('functions')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#func_grad)"/>
        {/* Lightning bolt with f(x) brackets */}
        <path d="M27 10L14 25H23L21 38L34 23H25L27 10Z" fill="#FCE100" stroke="#FF8C00" strokeWidth="1" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="func_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F2C80F"/>
            <stop offset="1" stopColor="#D97706"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('kubernetes') || norm.includes('aks')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#aks_grad)"/>
        {/* Helm wheel / nodes */}
        <circle cx="24" cy="24" r="6" fill="#326CE5" stroke="#FFFFFF" strokeWidth="2"/>
        <circle cx="24" cy="12" r="3" fill="#FFFFFF"/>
        <circle cx="34" cy="18" r="3" fill="#FFFFFF"/>
        <circle cx="34" cy="30" r="3" fill="#FFFFFF"/>
        <circle cx="24" cy="36" r="3" fill="#FFFFFF"/>
        <circle cx="14" cy="30" r="3" fill="#FFFFFF"/>
        <circle cx="14" cy="18" r="3" fill="#FFFFFF"/>
        <path d="M24 15V18M31 19.5L29 21M31 28.5L29 27M24 33V30M17 28.5L19 27M17 19.5L19 21" stroke="#FFFFFF" strokeWidth="2"/>
        <defs>
          <linearGradient id="aks_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#326CE5"/>
            <stop offset="1" stopColor="#004578"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('container_app')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#capp_grad)"/>
        <rect x="13" y="14" width="10" height="8" rx="1.5" fill="#50E6FF" stroke="#004578" strokeWidth="1"/>
        <rect x="25" y="14" width="10" height="8" rx="1.5" fill="#50E6FF" stroke="#004578" strokeWidth="1"/>
        <rect x="13" y="26" width="10" height="8" rx="1.5" fill="#50E6FF" stroke="#004578" strokeWidth="1"/>
        <rect x="25" y="26" width="10" height="8" rx="1.5" fill="#50E6FF" stroke="#004578" strokeWidth="1"/>
        <defs>
          <linearGradient id="capp_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#00B294"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('batch')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#batch_grad)"/>
        <rect x="14" y="14" width="20" height="20" rx="3" fill="#004578" stroke="#50E6FF" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="2" fill="#50E6FF"/>
        <circle cx="28" cy="20" r="2" fill="#50E6FF"/>
        <circle cx="20" cy="28" r="2" fill="#50E6FF"/>
        <circle cx="28" cy="28" r="2" fill="#50E6FF"/>
        <defs>
          <linearGradient id="batch_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#002050"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Storage
  if (norm.includes('storage') || norm.includes('blob') || norm.includes('st_')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#st_grad)"/>
        <path d="M14 15C14 13.3431 18.4772 12 24 12C29.5228 12 34 13.3431 34 15V33C34 34.6569 29.5228 36 24 36C18.4772 36 14 34.6569 14 33V15Z" fill="#107C41"/>
        <ellipse cx="24" cy="15" rx="10" ry="3" fill="#50E6FF"/>
        <path d="M14 21C14 22.6569 18.4772 24 24 24C29.5228 24 34 22.6569 34 21" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M14 27C14 28.6569 18.4772 30 24 30C29.5228 30 34 28.6569 34 27" stroke="#FFFFFF" strokeWidth="1.5"/>
        <defs>
          <linearGradient id="st_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#107C41"/>
            <stop offset="1" stopColor="#0B552C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('vault') || norm.includes('backup') || norm.includes('recovery')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#vault_grad)"/>
        <path d="M24 11L35 15V24C35 30.5 29.5 35.5 24 37C18.5 35.5 13 30.5 13 24V15L24 11Z" fill="#FFFFFF" stroke="#0078D4" strokeWidth="1.5"/>
        <circle cx="24" cy="24" r="4" fill="#0078D4"/>
        <path d="M24 20V24L27 25" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="vault_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#004E8C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Databases
  if (norm.includes('mssql') || norm.includes('sql_database') || norm.includes('sql_server')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#sql_grad)"/>
        <ellipse cx="24" cy="15" rx="11" ry="4" fill="#50E6FF"/>
        <path d="M13 15V33C13 35.2091 17.9249 37 24 37C30.0751 37 35 35.2091 35 33V15" stroke="#FFFFFF" strokeWidth="2"/>
        <path d="M13 21C13 23.2091 17.9249 25 24 25C30.0751 25 35 23.2091 35 21" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M13 27C13 29.2091 17.9249 31 24 31C30.0751 31 35 29.2091 35 27" stroke="#FFFFFF" strokeWidth="1.5"/>
        <defs>
          <linearGradient id="sql_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#003A66"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('cosmos') || norm.includes('cosmosdb')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#cosmos_grad)"/>
        {/* Glowing planetary sphere with orbit ring */}
        <circle cx="24" cy="24" r="9" fill="url(#cosmos_orb)"/>
        <ellipse cx="24" cy="24" rx="15" ry="5" transform="rotate(-30 24 24)" stroke="#50E6FF" strokeWidth="2" fill="none"/>
        <circle cx="12" cy="17" r="2" fill="#FFFFFF"/>
        <circle cx="36" cy="31" r="2" fill="#FFFFFF"/>
        <defs>
          <linearGradient id="cosmos_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5C2D91"/>
            <stop offset="1" stopColor="#0078D4"/>
          </linearGradient>
          <radialGradient id="cosmos_orb" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(21 21) scale(12)">
            <stop stopColor="#B4009E"/>
            <stop offset="1" stopColor="#00188F"/>
          </radialGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('postgres') || norm.includes('mysql')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#pg_grad)"/>
        <ellipse cx="24" cy="15" rx="10" ry="3.5" fill="#93C5FD"/>
        <path d="M14 15V32C14 34 18.5 35.5 24 35.5C29.5 35.5 34 34 34 32V15" stroke="#FFFFFF" strokeWidth="2"/>
        <path d="M14 21C14 23 18.5 24.5 24 24.5C29.5 24.5 34 23 34 21" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M14 26.5C14 28.5 18.5 30 24 30C29.5 30 34 28.5 34 26.5" stroke="#FFFFFF" strokeWidth="1.5"/>
        <defs>
          <linearGradient id="pg_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#336791"/>
            <stop offset="1" stopColor="#1D3E5E"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('redis')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#redis_grad)"/>
        <path d="M24 12L35 18L24 24L13 18L24 12Z" fill="#FF8C00"/>
        <path d="M13 22L24 28L35 22L35 25L24 31L13 25V22Z" fill="#D83B01"/>
        <path d="M13 29L24 35L35 29L35 32L24 38L13 32V29Z" fill="#A80000"/>
        <defs>
          <linearGradient id="redis_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D83B01"/>
            <stop offset="1" stopColor="#781000"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Security
  if (norm.includes('key_vault') || norm.includes('keyvault')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#kv_grad)"/>
        <path d="M24 11C18.5 11 14 15.5 14 21C14 25.5 17 29.2 21 30.5V37H27V30.5C31 29.2 34 25.5 34 21C34 15.5 29.5 11 24 11Z" fill="#FFE066" stroke="#D97706" strokeWidth="1.5"/>
        <circle cx="24" cy="20" r="3.5" fill="#78350F"/>
        <defs>
          <linearGradient id="kv_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B"/>
            <stop offset="1" stopColor="#B45309"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('identity') || norm.includes('role_assignment') || norm.includes('rbac')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#id_grad)"/>
        <rect x="12" y="12" width="24" height="24" rx="3" fill="#FFFFFF"/>
        <circle cx="24" cy="20" r="4" fill="#0078D4"/>
        <path d="M17 31C17 27.5 20 26 24 26C28 26 31 27.5 31 31H17Z" fill="#0078D4"/>
        <defs>
          <linearGradient id="id_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#004E8C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Networking & Gateways
  if (norm.includes('application_gateway') || norm.includes('app_gateway')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#agw_grad)"/>
        <circle cx="24" cy="14" r="3" fill="#FFFFFF"/>
        <circle cx="14" cy="34" r="3" fill="#50E6FF"/>
        <circle cx="24" cy="34" r="3" fill="#50E6FF"/>
        <circle cx="34" cy="34" r="3" fill="#50E6FF"/>
        <path d="M24 17V24M24 24L14 31M24 24V31M24 24L34 31" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="agw_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#002D50"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('firewall')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#fw_grad)"/>
        {/* Brick wall & shield */}
        <rect x="12" y="14" width="10" height="5" fill="#FFFFFF"/>
        <rect x="24" y="14" width="12" height="5" fill="#FFFFFF"/>
        <rect x="12" y="21" width="14" height="5" fill="#FFFFFF"/>
        <rect x="28" y="21" width="8" height="5" fill="#FFFFFF"/>
        <rect x="12" y="28" width="8" height="5" fill="#FFFFFF"/>
        <rect x="22" y="28" width="14" height="5" fill="#FFFFFF"/>
        <path d="M24 16L32 20V27C32 31.5 28.5 35 24 36C19.5 35 16 31.5 16 27V20L24 16Z" fill="#D83B01" stroke="#FFE066" strokeWidth="1.5"/>
        <defs>
          <linearGradient id="fw_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E81123"/>
            <stop offset="1" stopColor="#A80000"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('network_security_group') || norm === 'nsg') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#nsg_grad)"/>
        <path d="M24 12L34 16V25C34 30.5 29.5 34.5 24 36C18.5 34.5 14 30.5 14 25V16L24 12Z" fill="#0078D4" stroke="#50E6FF" strokeWidth="1.5"/>
        <circle cx="24" cy="22" r="3" fill="#FFFFFF"/>
        <rect x="22" y="24" width="4" height="5" rx="1" fill="#FFFFFF"/>
        <defs>
          <linearGradient id="nsg_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5C2D91"/>
            <stop offset="1" stopColor="#0078D4"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('public_ip')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#pip_grad)"/>
        <circle cx="24" cy="24" r="11" stroke="#FFFFFF" strokeWidth="2" fill="none"/>
        <ellipse cx="24" cy="24" rx="5" ry="11" stroke="#50E6FF" strokeWidth="1.5" fill="none"/>
        <line x1="13" y1="24" x2="35" y2="24" stroke="#50E6FF" strokeWidth="1.5"/>
        <defs>
          <linearGradient id="pip_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#004E8C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('private_endpoint')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#pe_grad)"/>
        <circle cx="16" cy="24" r="4" fill="#FFFFFF"/>
        <circle cx="32" cy="24" r="4" fill="#50E6FF"/>
        <path d="M20 24H28" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="2 2"/>
        <rect x="22" y="19" width="4" height="10" rx="1" fill="#004578"/>
        <defs>
          <linearGradient id="pe_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#002D50"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('lb') || norm.includes('load_balancer')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#lb_grad)"/>
        <circle cx="24" cy="24" r="5" fill="#50E6FF"/>
        <path d="M12 24H19M29 24H36M24 12V19M24 29V36" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="24" r="2.5" fill="#FFFFFF"/>
        <circle cx="36" cy="24" r="2.5" fill="#FFFFFF"/>
        <circle cx="24" cy="12" r="2.5" fill="#FFFFFF"/>
        <circle cx="24" cy="36" r="2.5" fill="#FFFFFF"/>
        <defs>
          <linearGradient id="lb_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5C2D91"/>
            <stop offset="1" stopColor="#0078D4"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // AI & ML
  if (norm.includes('cognitive') || norm.includes('openai') || norm.includes('ai')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#ai_grad)"/>
        {/* Brain neural network */}
        <circle cx="24" cy="16" r="3" fill="#FFFFFF"/>
        <circle cx="16" cy="24" r="3" fill="#50E6FF"/>
        <circle cx="32" cy="24" r="3" fill="#50E6FF"/>
        <circle cx="20" cy="32" r="3" fill="#FFFFFF"/>
        <circle cx="28" cy="32" r="3" fill="#FFFFFF"/>
        <line x1="24" y1="16" x2="16" y2="24" stroke="#FFFFFF" strokeWidth="1.5"/>
        <line x1="24" y1="16" x2="32" y2="24" stroke="#FFFFFF" strokeWidth="1.5"/>
        <line x1="16" y1="24" x2="20" y2="32" stroke="#FFFFFF" strokeWidth="1.5"/>
        <line x1="32" y1="24" x2="28" y2="32" stroke="#FFFFFF" strokeWidth="1.5"/>
        <line x1="20" y1="32" x2="28" y2="32" stroke="#50E6FF" strokeWidth="1.5"/>
        <circle cx="24" cy="24" r="2" fill="#EC4899"/>
        <defs>
          <linearGradient id="ai_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E3008C"/>
            <stop offset="1" stopColor="#0078D4"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Messaging & Integration
  if (norm.includes('servicebus') || norm.includes('service_bus')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#sb_grad)"/>
        <rect x="13" y="16" width="22" height="6" rx="2" fill="#50E6FF"/>
        <rect x="13" y="26" width="22" height="6" rx="2" fill="#FFFFFF"/>
        <circle cx="17" cy="19" r="1.5" fill="#004578"/>
        <circle cx="22" cy="19" r="1.5" fill="#004578"/>
        <circle cx="17" cy="29" r="1.5" fill="#004578"/>
        <circle cx="22" cy="29" r="1.5" fill="#004578"/>
        <defs>
          <linearGradient id="sb_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#00188F"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('eventhub') || norm.includes('event_hub')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#eh_grad)"/>
        <circle cx="24" cy="24" r="10" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3"/>
        <circle cx="24" cy="24" r="4" fill="#50E6FF"/>
        <path d="M24 14V10M34 24H38M24 34V38M14 24H10" stroke="#50E6FF" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="eh_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#107C41"/>
            <stop offset="1" stopColor="#0078D4"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('logic_app') || norm.includes('api_management')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#logic_grad)"/>
        <rect x="13" y="14" width="8" height="8" rx="2" fill="#50E6FF"/>
        <rect x="27" y="14" width="8" height="8" rx="2" fill="#FFFFFF"/>
        <rect x="20" y="26" width="8" height="8" rx="2" fill="#50E6FF"/>
        <path d="M17 22V24H24V26M31 22V24H24" stroke="#FFFFFF" strokeWidth="1.5"/>
        <defs>
          <linearGradient id="logic_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#5C2D91"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Default Azure Generic Cloud Resource Icon
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#default_azure_grad)"/>
      <path d="M21 16L30 24L21 32L17 28L23 24L17 20L21 16Z" fill="#50E6FF"/>
      <circle cx="32" cy="24" r="2.5" fill="#FFFFFF"/>
      <defs>
        <linearGradient id="default_azure_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0078D4"/>
          <stop offset="1" stopColor="#004E8C"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

export const getAzureColor = (type: string): string => {
  const norm = type.toLowerCase();
  if (norm.includes('resource_group') || norm === 'rg') return '#714EFF';
  if (norm.includes('virtual_network') || norm === 'vnet') return '#0078D4';
  if (norm.includes('subnet')) return '#818CF8';
  if (norm.includes('vm') || norm.includes('virtual_machine')) return '#0078D4';
  if (norm.includes('web_app') || norm.includes('app_service')) return '#0078D4';
  if (norm.includes('function')) return '#F59E0B';
  if (norm.includes('aks') || norm.includes('kubernetes')) return '#326CE5';
  if (norm.includes('storage') || norm.includes('blob')) return '#107C41';
  if (norm.includes('sql') || norm.includes('postgres') || norm.includes('database')) return '#0078D4';
  if (norm.includes('cosmos')) return '#8661C5';
  if (norm.includes('key_vault')) return '#F59E0B';
  if (norm.includes('firewall')) return '#EF4444';
  if (norm.includes('cognitive') || norm.includes('openai') || norm.includes('ai')) return '#EC4899';
  if (norm.includes('servicebus') || norm.includes('eventhub')) return '#06B6D4';
  return '#0078D4';
};

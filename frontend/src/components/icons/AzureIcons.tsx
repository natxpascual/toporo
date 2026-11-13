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

  if ((norm.includes('vault') && !norm.includes('key_vault') && !norm.includes('keyvault')) || norm.includes('backup') || norm.includes('recovery')) {
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

  // Container Registry (ACR)
  if (norm.includes('container_registry') || norm.includes('acr')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#acr_grad)"/>
        {/* Registry Cargo Container */}
        <path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" fill="#004578" stroke="#50E6FF" strokeWidth="1.5"/>
        <path d="M24 12L36 18L24 24L12 18L24 12Z" fill="#50E6FF" fillOpacity="0.8"/>
        <path d="M24 24V36" stroke="#50E6FF" strokeWidth="1.5"/>
        <circle cx="24" cy="24" r="3" fill="#FFFFFF"/>
        <rect x="18" y="27" width="4" height="5" rx="0.5" fill="#50E6FF"/>
        <rect x="26" y="27" width="4" height="5" rx="0.5" fill="#50E6FF"/>
        <defs>
          <linearGradient id="acr_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#008272"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Azure Bastion
  if (norm.includes('bastion')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#bastion_grad)"/>
        {/* Castle / Fortress battlement turret */}
        <path d="M14 16H18V19H22V16H26V19H30V16H34V34H14V16Z" fill="#004578" stroke="#50E6FF" strokeWidth="1.5"/>
        {/* Secure gate arch */}
        <path d="M20 34V26C20 23.7909 21.7909 22 24 22C26.2091 22 28 23.7909 28 26V34H20Z" fill="#50E6FF"/>
        <circle cx="24" cy="25" r="1.5" fill="#002447"/>
        <defs>
          <linearGradient id="bastion_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#002D50"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // NAT Gateway
  if (norm.includes('nat_gateway')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#nat_grad)"/>
        <rect x="12" y="16" width="24" height="16" rx="3" fill="#004578" stroke="#FFFFFF" strokeWidth="1.5"/>
        {/* Dual Translation Arrows */}
        <path d="M17 21H31M31 21L27 18M31 21L27 24" stroke="#50E6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M31 27H17M17 27L21 24M17 27L21 30" stroke="#FFE066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="nat_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#004E8C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Route Table
  if (norm.includes('route_table')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#route_grad)"/>
        {/* Network Waypoints & Paths */}
        <circle cx="16" cy="18" r="4" fill="#FFFFFF"/>
        <circle cx="32" cy="18" r="4" fill="#50E6FF"/>
        <circle cx="24" cy="32" r="4" fill="#FFFFFF"/>
        <path d="M19 18H29M18 21L22 29M30 21L26 29" stroke="#50E6FF" strokeWidth="2" strokeDasharray="2 2"/>
        <circle cx="16" cy="18" r="1.5" fill="#004578"/>
        <circle cx="32" cy="18" r="1.5" fill="#004578"/>
        <circle cx="24" cy="32" r="1.5" fill="#004578"/>
        <defs>
          <linearGradient id="route_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#003A66"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // DNS Zone & Private DNS Zone
  if (norm.includes('dns')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#dns_grad)"/>
        <circle cx="24" cy="24" r="11" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
        <ellipse cx="24" cy="24" rx="5" ry="11" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
        <line x1="13" y1="24" x2="35" y2="24" stroke="#FFFFFF" strokeWidth="1.5"/>
        {/* DNS Tag / Pointer badge */}
        <circle cx="32" cy="16" r="4" fill="#50E6FF" stroke="#004578" strokeWidth="1"/>
        <path d="M30 16H34M32 14V18" stroke="#004578" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="dns_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#004E8C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Virtual Network Gateway / VPN Gateway
  if (norm.includes('virtual_network_gateway') || norm.includes('vpn')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#vpn_grad)"/>
        {/* Tunnel Bridge */}
        <path d="M12 28V20C12 15 16 14 24 14C32 14 36 15 36 20V28" stroke="#FFFFFF" strokeWidth="2.5" fill="none"/>
        <rect x="19" y="24" width="10" height="10" rx="2" fill="#50E6FF" stroke="#004578" strokeWidth="1"/>
        <path d="M21 24V21C21 19.3431 22.3431 18 24 18C25.6569 18 27 19.3431 27 21V24" stroke="#004578" strokeWidth="1.5" fill="none"/>
        <circle cx="24" cy="29" r="1.5" fill="#004578"/>
        <defs>
          <linearGradient id="vpn_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#5C2D91"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Azure Front Door / Traffic Manager
  if (norm.includes('frontdoor') || norm.includes('front_door') || norm.includes('traffic_manager')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#fd_grad)"/>
        <circle cx="24" cy="24" r="12" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
        <path d="M12 24H36" stroke="#FFFFFF" strokeWidth="1.5"/>
        {/* Ingress Gateway Doorway */}
        <path d="M20 18L28 14V34L20 30V18Z" fill="#50E6FF" stroke="#004578" strokeWidth="1"/>
        <circle cx="26" cy="24" r="1" fill="#004578"/>
        <defs>
          <linearGradient id="fd_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#002D50"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Log Analytics Workspace
  if (norm.includes('log_analytics')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#la_grad)"/>
        {/* Telemetry Ledger */}
        <rect x="13" y="13" width="22" height="22" rx="3" fill="#FFFFFF"/>
        <path d="M17 19H31M17 24H27M17 29H23" stroke="#0078D4" strokeWidth="2" strokeLinecap="round"/>
        {/* Analytics Query Lens */}
        <circle cx="29" cy="27" r="5" fill="#50E6FF" stroke="#004578" strokeWidth="1.5"/>
        <path d="M33 31L37 35" stroke="#004578" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="la_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#00188F"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Application Insights
  if (norm.includes('application_insights') || norm.includes('app_insights')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#ai_apm_grad)"/>
        {/* Diagnostic APM Lightbulb & ECG Pulse */}
        <path d="M24 12C18.4772 12 14 16.4772 14 22C14 25.5 16 28.5 19 30V34H29V30C32 28.5 34 25.5 34 22C34 16.4772 29.5228 12 24 12Z" fill="#FFFFFF" fillOpacity="0.2" stroke="#FFFFFF" strokeWidth="1.5"/>
        {/* ECG pulse wave */}
        <path d="M16 22H21L23 17L26 27L28 22H32" stroke="#50E6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="21" y="34" width="6" height="2" rx="1" fill="#FFFFFF"/>
        <defs>
          <linearGradient id="ai_apm_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6B21A8"/>
            <stop offset="1" stopColor="#0078D4"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Azure Synapse Analytics & Data Explorer
  if (norm.includes('synapse') || norm.includes('kusto')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#syn_grad)"/>
        {/* Interlocking Analytical Vortex */}
        <circle cx="24" cy="24" r="10" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 2" fill="none"/>
        <circle cx="24" cy="24" r="4" fill="#50E6FF"/>
        <circle cx="24" cy="14" r="2.5" fill="#50E6FF"/>
        <circle cx="34" cy="24" r="2.5" fill="#50E6FF"/>
        <circle cx="24" cy="34" r="2.5" fill="#50E6FF"/>
        <circle cx="14" cy="24" r="2.5" fill="#50E6FF"/>
        <defs>
          <linearGradient id="syn_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#5C2D91"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Azure Data Factory
  if (norm.includes('data_factory')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#adf_grad)"/>
        {/* Factory pipes & pipeline */}
        <rect x="14" y="22" width="20" height="12" rx="2" fill="#004578" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M18 22V14M24 22V14M30 22V14" stroke="#50E6FF" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="28" r="3" fill="#50E6FF"/>
        <defs>
          <linearGradient id="adf_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#00A3BF"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Azure Databricks
  if (norm.includes('databricks')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#dbx_grad)"/>
        {/* Databricks stacked diamonds */}
        <path d="M24 11L33 16L24 21L15 16L24 11Z" fill="#FFE066"/>
        <path d="M15 20L24 25L33 20L33 23L24 28L15 23V20Z" fill="#FF8C00"/>
        <path d="M15 27L24 32L33 27L33 30L24 35L15 30V27Z" fill="#D83B01"/>
        <defs>
          <linearGradient id="dbx_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF8C00"/>
            <stop offset="1" stopColor="#B4009E"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Event Grid
  if (norm.includes('eventgrid') || norm.includes('event_grid')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#eg_grad)"/>
        {/* Event Matrix Starburst */}
        <circle cx="24" cy="24" r="5" fill="#50E6FF"/>
        <circle cx="15" cy="15" r="3" fill="#FFFFFF"/>
        <circle cx="33" cy="15" r="3" fill="#FFFFFF"/>
        <circle cx="15" cy="33" r="3" fill="#FFFFFF"/>
        <circle cx="33" cy="33" r="3" fill="#FFFFFF"/>
        <line x1="17" y1="17" x2="21" y2="21" stroke="#FFFFFF" strokeWidth="2"/>
        <line x1="31" y1="17" x2="27" y2="21" stroke="#FFFFFF" strokeWidth="2"/>
        <line x1="17" y1="31" x2="21" y2="27" stroke="#FFFFFF" strokeWidth="2"/>
        <line x1="31" y1="31" x2="27" y2="27" stroke="#FFFFFF" strokeWidth="2"/>
        <defs>
          <linearGradient id="eg_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5C2D91"/>
            <stop offset="1" stopColor="#0078D4"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // SignalR Service
  if (norm.includes('signalr')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#sig_grad)"/>
        <circle cx="24" cy="28" r="4" fill="#50E6FF"/>
        <path d="M17 21C20.866 17.134 27.134 17.134 31 21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M13 17C19.0751 10.9249 28.9249 10.9249 35 17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <defs>
          <linearGradient id="sig_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#008272"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Search Service (Azure AI Search)
  if (norm.includes('search')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#srch_grad)"/>
        {/* Search Lens over AI nodes */}
        <circle cx="22" cy="22" r="9" stroke="#FFFFFF" strokeWidth="2.5" fill="#004578" fillOpacity="0.4"/>
        <path d="M29 29L36 36" stroke="#50E6FF" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="22" cy="22" r="3" fill="#EC4899"/>
        <defs>
          <linearGradient id="srch_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#E3008C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Microsoft Sentinel
  if (norm.includes('sentinel')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#sen_grad)"/>
        <path d="M24 11L35 15V24C35 30.5 29.5 35.5 24 37C18.5 35.5 13 30.5 13 24V15L24 11Z" fill="#002447" stroke="#50E6FF" strokeWidth="2"/>
        <circle cx="24" cy="24" r="6" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
        <circle cx="24" cy="24" r="2.5" fill="#EC4899"/>
        <defs>
          <linearGradient id="sen_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#002050"/>
            <stop offset="1" stopColor="#0078D4"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // WAF Policy
  if (norm.includes('waf') || norm.includes('web_application_firewall')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#waf_grad)"/>
        <path d="M24 12L34 16V25C34 30.5 29.5 34.5 24 36C18.5 34.5 14 30.5 14 25V16L24 12Z" fill="#A80000" stroke="#FFE066" strokeWidth="1.5"/>
        <path d="M21 21L18 24L21 27" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M27 21L30 24L27 27" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="waf_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E81123"/>
            <stop offset="1" stopColor="#8661C5"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // VM Scale Set (VMSS)
  if (norm.includes('scale_set') || norm.includes('vmss')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="url(#vmss_grad)"/>
        {/* Layered VM blocks */}
        <rect x="18" y="12" width="18" height="14" rx="2" fill="#004578" stroke="#FFFFFF" strokeWidth="1"/>
        <rect x="15" y="16" width="18" height="14" rx="2" fill="#005BA1" stroke="#FFFFFF" strokeWidth="1"/>
        <rect x="12" y="20" width="18" height="14" rx="2" fill="#0078D4" stroke="#50E6FF" strokeWidth="1.5"/>
        <circle cx="17" cy="27" r="1.5" fill="#50E6FF"/>
        <circle cx="22" cy="27" r="1.5" fill="#50E6FF"/>
        <defs>
          <linearGradient id="vmss_grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078D4"/>
            <stop offset="1" stopColor="#003A66"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (norm.includes('terraform') || norm.includes('hcl')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="#1c1917" />
        <polygon points="15,12 22.5,16.3 22.5,25 15,20.7" fill="#a7e68f" />
        <polygon points="24,17.2 31.5,21.5 31.5,30.2 24,25.9" fill="#5c4ee5" />
        <polygon points="33,12 33,20.7 25.5,16.3" fill="#7b6ef6" />
        <polygon points="24,27.3 31.5,31.6 31.5,39.5 24,35.2" fill="#5c4ee5" fillOpacity="0.85" />
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
  if (norm.includes('container_registry') || norm.includes('acr')) return '#0284C7';
  if (norm.includes('storage') || norm.includes('blob')) return '#107C41';
  if (norm.includes('sql') || norm.includes('postgres') || norm.includes('database')) return '#0078D4';
  if (norm.includes('cosmos')) return '#8661C5';
  if (norm.includes('redis')) return '#DC2626';
  if (norm.includes('key_vault')) return '#F59E0B';
  if (norm.includes('firewall')) return '#EF4444';
  if (norm.includes('bastion')) return '#2563EB';
  if (norm.includes('cognitive') || norm.includes('openai') || norm.includes('ai') || norm.includes('search')) return '#EC4899';
  if (norm.includes('servicebus') || norm.includes('eventhub') || norm.includes('eventgrid')) return '#06B6D4';
  if (norm.includes('log_analytics') || norm.includes('application_insights')) return '#8B5CF6';
  if (norm.includes('databricks')) return '#EA580C';
  if (norm.includes('synapse') || norm.includes('data_factory')) return '#0D9488';
  if (norm.includes('sentinel')) return '#1E40AF';
  return '#0078D4';
};

const FRIENDLY_NAMES: Record<string, string> = {
  azurerm_resource_group: 'Resource Group',
  azurerm_virtual_network: 'Virtual Network',
  azurerm_subnet: 'Subnet',
  azurerm_container_registry: 'Container Registry',
  azurerm_linux_virtual_machine: 'Linux VM',
  azurerm_windows_virtual_machine: 'Windows VM',
  azurerm_linux_virtual_machine_scale_set: 'VM Scale Set',
  azurerm_service_plan: 'App Service Plan',
  azurerm_linux_web_app: 'Web App',
  azurerm_windows_web_app: 'Web App (Windows)',
  azurerm_linux_function_app: 'Function App',
  azurerm_windows_function_app: 'Function App (Windows)',
  azurerm_kubernetes_cluster: 'AKS Cluster',
  azurerm_container_app: 'Container App',
  azurerm_container_app_environment: 'Container App Env',
  azurerm_container_group: 'Container Instance',
  azurerm_batch_account: 'Batch Account',
  azurerm_firewall: 'Azure Firewall',
  azurerm_firewall_policy: 'Firewall Policy',
  azurerm_application_gateway: 'Application Gateway',
  azurerm_lb: 'Load Balancer',
  azurerm_public_ip: 'Public IP',
  azurerm_nat_gateway: 'NAT Gateway',
  azurerm_network_security_group: 'Security Group',
  azurerm_route_table: 'Route Table',
  azurerm_virtual_network_peering: 'VNet Peering',
  azurerm_private_endpoint: 'Private Endpoint',
  azurerm_private_dns_zone: 'Private DNS Zone',
  azurerm_dns_zone: 'Azure DNS Zone',
  azurerm_virtual_network_gateway: 'VPN Gateway',
  azurerm_bastion_host: 'Azure Bastion',
  azurerm_frontdoor: 'Azure Front Door',
  azurerm_traffic_manager_profile: 'Traffic Manager',
  azurerm_storage_account: 'Storage Account',
  azurerm_storage_container: 'Blob Container',
  azurerm_storage_share: 'File Share',
  azurerm_backup_vault: 'Backup Vault',
  azurerm_recovery_services_vault: 'Recovery Vault',
  azurerm_netapp_account: 'NetApp Files',
  azurerm_redis_cache: 'Redis Cache',
  azurerm_redis_enterprise_cluster: 'Redis Enterprise',
  azurerm_mssql_server: 'Azure SQL Server',
  azurerm_mssql_database: 'Azure SQL Database',
  azurerm_cosmosdb_account: 'Cosmos DB',
  azurerm_postgresql_flexible_server: 'PostgreSQL Server',
  azurerm_mysql_flexible_server: 'MySQL Server',
  azurerm_synapse_workspace: 'Synapse Analytics',
  azurerm_kusto_cluster: 'Data Explorer',
  azurerm_key_vault: 'Key Vault',
  azurerm_key_vault_secret: 'Key Vault Secret',
  azurerm_user_assigned_identity: 'Managed Identity',
  azurerm_role_assignment: 'RBAC Role',
  azurerm_sentinel_log_analytics_workspace_onboarding: 'Microsoft Sentinel',
  azurerm_web_application_firewall_policy: 'WAF Policy',
  azurerm_cognitive_account: 'Azure OpenAI',
  azurerm_machine_learning_workspace: 'Machine Learning',
  azurerm_search_service: 'AI Search',
  azurerm_bot_channels_registration: 'Bot Service',
  azurerm_servicebus_namespace: 'Service Bus',
  azurerm_servicebus_queue: 'Service Bus Queue',
  azurerm_servicebus_topic: 'Service Bus Topic',
  azurerm_eventhub_namespace: 'Event Hubs',
  azurerm_eventgrid_topic: 'Event Grid',
  azurerm_logic_app_workflow: 'Logic App',
  azurerm_api_management: 'API Management',
  azurerm_signalr_service: 'SignalR Service',
  azurerm_data_factory: 'Data Factory',
  azurerm_databricks_workspace: 'Databricks',
  azurerm_log_analytics_workspace: 'Log Analytics',
  azurerm_application_insights: 'App Insights',
  azurerm_monitor_action_group: 'Action Group',
};

export const getFriendlyTypeName = (type: string = ''): string => {
  const clean = type.toLowerCase().trim();
  if (FRIENDLY_NAMES[clean]) return FRIENDLY_NAMES[clean];
  const withoutPrefix = clean.replace(/^azurerm_/, '').replace(/^microsoft\.[^/]+\//, '');
  return withoutPrefix
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

# Sample Architecture: Hub and Spoke Network Topology
resource "azurerm_resource_group" "rg_hub_spoke" {
  name     = "rg-hub-spoke-network"
  location = "eastus2"
}

resource "azurerm_virtual_network" "vnet_hub" {
  name                = "vnet-hub"
  location            = azurerm_resource_group.rg_hub_spoke.location
  resource_group_name = azurerm_resource_group.rg_hub_spoke.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "snet_gateway" {
  name                 = "GatewaySubnet"
  resource_group_name  = azurerm_resource_group.rg_hub_spoke.name
  virtual_network_name = azurerm_virtual_network.vnet_hub.name
  address_prefixes     = ["10.0.0.0/24"]
}

resource "azurerm_virtual_network" "vnet_spoke" {
  name                = "vnet-spoke-app"
  location            = azurerm_resource_group.rg_hub_spoke.location
  resource_group_name = azurerm_resource_group.rg_hub_spoke.name
  address_space       = ["10.1.0.0/16"]
}

resource "azurerm_subnet" "snet_app" {
  name                 = "snet-workloads"
  resource_group_name  = azurerm_resource_group.rg_hub_spoke.name
  virtual_network_name = azurerm_virtual_network.vnet_spoke.name
  address_prefixes     = ["10.1.1.0/24"]
}

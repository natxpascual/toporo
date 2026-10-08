# Sample Architecture: Basic Azure Virtual Network with Linux VM
resource "azurerm_resource_group" "rg_basic" {
  name     = "rg-basic-demo"
  location = "eastus"
}

resource "azurerm_virtual_network" "vnet_basic" {
  name                = "vnet-basic"
  location            = azurerm_resource_group.rg_basic.location
  resource_group_name = azurerm_resource_group.rg_basic.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "subnet_web" {
  name                 = "snet-web"
  resource_group_name  = azurerm_resource_group.rg_basic.name
  virtual_network_name = azurerm_virtual_network.vnet_basic.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_linux_virtual_machine" "vm_web" {
  name                = "vm-web-server"
  resource_group_name = azurerm_resource_group.rg_basic.name
  location            = azurerm_resource_group.rg_basic.location
  size                = "Standard_B2s"
  admin_username      = "azureuser"
}

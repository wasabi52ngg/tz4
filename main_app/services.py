"""
Сервис для работы с компаниями и адресами через API Битрикс24
"""
from integration_utils.bitrix24.models import BitrixUserToken


class BitrixCompanyService:
    """Сервис для работы с компаниями и адресами через integration_utils"""

    def __init__(self, user_token: BitrixUserToken):
        self.user_token = user_token

    def get_companies_list(self):
        """
        Получить список компаний
        """
        try:
            return self.user_token.call_api_method(
                'crm.company.list',
                {
                    'select': ['ID', 'TITLE', 'COMPANY_TYPE', 'INDUSTRY', 'REVENUE', 'CURRENCY_ID'],
                    'order': {'TITLE': 'ASC'}
                }
            )
        except Exception as e:
            print(f"Ошибка при получении списка компаний: {e}")
            return {'result': []}

    def get_company_addresses(self, company_id):
        """
        Получить адреса компании
        """
        try:
            return self.user_token.call_api_method(
                'crm.address.list',
                {
                    'filter': {
                        'ENTITY_TYPE_ID': 4,
                        'ENTITY_ID': company_id
                    },
                    'select': ['TYPE_ID', 'ADDRESS_1', 'ADDRESS_2', 'CITY', 'POSTAL_CODE', 'REGION', 'PROVINCE', 'COUNTRY']
                }
            )
        except Exception as e:
            print(f"Ошибка при получении адресов компании {company_id}: {e}")
            return {'result': []}

    def get_companies_with_addresses(self):
        """
        Получить список компаний с их адресами
        """
        try:
            companies_response = self.get_companies_list()
            if not companies_response.get('result'):
                return []

            companies = companies_response['result']
            companies_with_addresses = []

            for company in companies:
                company_id = company['ID']
                company_title = company.get('TITLE', 'Без названия')
                
                addresses_response = self.get_company_addresses(company_id)
                addresses = addresses_response.get('result', [])
                
                formatted_addresses = []
                for address in addresses:
                    address_parts = []
                    
                    if address.get('ADDRESS_1'):
                        address_parts.append(address['ADDRESS_1'])
                    if address.get('ADDRESS_2'):
                        address_parts.append(f"кв. {address['ADDRESS_2']}")
                    if address.get('CITY'):
                        address_parts.append(address['CITY'])
                    if address.get('POSTAL_CODE'):
                        address_parts.append(address['POSTAL_CODE'])
                    if address.get('REGION'):
                        address_parts.append(address['REGION'])
                    if address.get('PROVINCE'):
                        address_parts.append(address['PROVINCE'])
                    if address.get('COUNTRY'):
                        address_parts.append(address['COUNTRY'])
                    
                    formatted_address = ', '.join(address_parts) if address_parts else 'Адрес не указан'
                    formatted_addresses.append(formatted_address)

                company_data = {
                    'id': company_id,
                    'title': company_title,
                    'company_type': company.get('COMPANY_TYPE', ''),
                    'industry': company.get('INDUSTRY', ''),
                    'revenue': company.get('REVENUE', ''),
                    'currency_id': company.get('CURRENCY_ID', ''),
                    'addresses': formatted_addresses
                }
                
                companies_with_addresses.append(company_data)

            return companies_with_addresses

        except Exception as e:
            print(f"Ошибка при получении компаний с адресами: {e}")
            return []

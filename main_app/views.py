from django.shortcuts import render
from integration_utils.bitrix24.bitrix_user_auth.main_auth import main_auth
from django.conf import settings
from .services import BitrixCompanyService


@main_auth(on_cookies=True)
def index(request):
    """Главная страница приложения"""
    app_settings = settings.APP_SETTINGS
    context = {
        'user': request.bitrix_user,
        'is_authenticated': True,
        'app_settings': app_settings
    }
    return render(request, 'main_app/index.html', context)


@main_auth(on_cookies=True)
def companies_list(request):
    """Страница со списком компаний и их адресов"""
    try:
        service = BitrixCompanyService(request.bitrix_user_token)
        companies_data = service.get_companies_with_addresses()

        context = {
            'companies': companies_data,
            'user': request.bitrix_user,
            'error_message': None,
        }

    except Exception as e:
        print(f"Ошибка в представлении companies_list: {e}")
        context = {
            'companies': [],
            'user': request.bitrix_user,
            'error_message': f"Ошибка загрузки данных: {str(e)}",
        }

    return render(request, 'main_app/companies_list.html', context)

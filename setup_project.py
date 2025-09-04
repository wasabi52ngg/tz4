#!/usr/bin/env python3
"""
Скрипт для настройки нового проекта Django для Битрикс24
Использование: python setup_project.py <название_проекта>
"""

import os
import sys
import re
import shutil
from pathlib import Path


def replace_in_file(file_path, replacements):
    """Заменяет текст в файле согласно словарю замен"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old_text, new_text in replacements.items():
            content = content.replace(old_text, new_text)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Обновлен файл: {file_path}")
    except Exception as e:
        print(f"✗ Ошибка при обновлении {file_path}: {e}")


def setup_project(project_name):
    """Настраивает проект с новым именем"""
    
    # Валидация имени проекта
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', project_name):
        print("✗ Ошибка: Имя проекта должно начинаться с буквы и содержать только буквы, цифры и подчеркивания")
        return False
    
    print(f"Настройка проекта: {project_name}")
    
    # Словарь замен
    replacements = {
        'PROJECT_NAME_PLACEHOLDER': project_name,
    }
    
    # Файлы для обновления
    files_to_update = [
        'settings.py',
        'local_settings.py',
        'templates/base.html',
        'main_app/templates/main_app/index.html',
    ]
    
    # Обновляем файлы
    for file_path in files_to_update:
        if os.path.exists(file_path):
            replace_in_file(file_path, replacements)
        else:
            print(f"⚠ Файл не найден: {file_path}")
    
    print(f"\n✓ Проект '{project_name}' успешно настроен!")
    print("\nСледующие шаги:")
    print("1. Скопируйте папку integration_utils из существующего проекта")
    print("2. Настройте local_settings.py с вашими данными")
    print("3. Создайте виртуальное окружение: python -m venv venv")
    print("4. Активируйте виртуальное окружение")
    print("5. Установите зависимости: pip install -r requirements.txt")
    print("6. Выполните миграции: python manage.py migrate")
    print("7. Запустите сервер: python manage.py runserver")
    
    return True


def main():
    if len(sys.argv) != 2:
        print("Использование: python setup_project.py <название_проекта>")
        print("Пример: python setup_project.py my_bitrix_app")
        sys.exit(1)
    
    project_name = sys.argv[1]
    setup_project(project_name)


if __name__ == '__main__':
    main()

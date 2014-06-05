"""
Django settings for LC project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ')hs%ach&dj6v!v%i54j@6kcwgn9x_n#5l0dlp&xf)88m0(hpm3'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    #'django-socketio',
    'chat',
    'south',
    'storages',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'LC.urls'

WSGI_APPLICATION = 'LC.wsgi.application'


TEMPLATE_DIRS = {
                 os.path.join(BASE_DIR, 'templates').replace('\\','/'),
                 }


AUTHENTICATION_BACKENDS = ('django.contrib.auth.backends.ModelBackend',
                           'chat.auth_backend.PasswordlessAuthBackend',
                           )





# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'dbizzle3',
        'USER': 'root',
        'PASSWORD':'massive1',
        'HOST': '',
        
    }
}


# LOGGING DOG
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'standard': {
            'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt' : "%d/%b/%Y %H:%M:%S"
        },
    },
    'handlers': {
        'null': {
            'level':'DEBUG',
            'class':'django.utils.log.NullHandler',
        },
        'logfile': {
            'level':'DEBUG',
            'class':'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR + "/logs/logfile",
            'maxBytes': 50000,
            'backupCount': 2,
            'formatter': 'standard',
        },
        'console':{
            'level':'INFO',
            'class':'logging.StreamHandler',
            'formatter': 'standard'
        },
    },
    'loggers': {
        'django': {
            'handlers':['console'],
            'propagate': True,
            'level':'WARN',
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'chat': {
            'handlers': ['console', 'logfile'],
            'level': 'DEBUG',
        },
    }
}

# celery stuff
BROKER_URL = 'redis://localhost:6379/0'

BROKER_TRANSPORT_OPTIONS = {'visibility_timeout':3600} # 1 hour



# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATICFILES_DIRS = (os.path.join(BASE_DIR, 'static'),)

STATIC_URL = '/static/'

STATIC_ROOT = '/static-root/'

MEDIA_URL = '/media/'




if not DEBUG:
        AWS_STORAGE_BUCKET_NAME = 'LCBucket'
        STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
        S3_URL = 'http://%s.s3.amazonaws.com/'% AWS_STORAGE_BUCKET_NAME
        STATIC_URL = S3_URL


from django.urls import path
from . import views

urlpatterns = [
    path('', views.map, name='index'),
    path('getdata', views.getData, name='getdata'),
    path('getreview', views.getReviewById, name='getreview'),
    path('updateorder', views.updateOrder, name='updateorder')
    # path('addpoi', views.addPoi, name='addpoi'),
]

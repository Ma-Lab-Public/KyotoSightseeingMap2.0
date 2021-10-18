from django.shortcuts import render
from django.conf import settings
from django.views import generic
from map.models import Poi, Photo, Review
from django.http import JsonResponse
from haversine import haversine
import pandas as pd
import csv
import os

# Create your views here.
def map(request):

    opt = {
        'GOOGLE_MAP_API_KEY': settings.GOOGLE_MAP_API_KEY,
    }
    return render(request, 'index.html', opt)
def cost(route, pois):
    dis = 0
    for i in range(1, len(route)):
        p = pois[route[i-1]]
        q = pois[route[i]]
        dis += haversine((p['lat'], p['lng']),(q['lat'], q['lng']))
    return dis

def two_opt(route, pois):
    best = route
    improved = True
    while improved:
        improved = False
        for i in range(1, len(route) - 2):
            for j in range(i + 1, len(route)):
                if j - i == 1: continue  # changes nothing, skip then
                new_route = route[:]
                new_route[i:j] = route[j - 1:i - 1:-1]  # this is the 2woptSwap
                if cost(new_route, pois) < cost(best, pois):
                    best = new_route
                    improved = True
                    route = best
    return best

def getData(request):
    # with open(os.path.join(settings.PROJECT_ROOT, 'ID_loc_GPS.tsv')) as f:
    #     reader = csv.reader(f)
    #     for row in reader:
    #         _, created = Poi.objects.get_or_create(
    #             pid = row[0],
    #             pname = row[1],
    #             lat = float(row[3]),
    #             lng = float(row[2])
    #
    #         )
    # Review.objects.all().delete()
    # df = pd.read_table(os.path.join(settings.PROJECT_ROOT,'clean_rename_questionnaire_info.tsv'))
    # for i in range(df.shape[0]):
    #     # print(df.loc[i])
    #     _, created = Review.objects.get_or_create(
    #         review_id = i,
    #         pid = df.loc[i, 'loc_id'],
    #         text = df.loc[i, 'reason']
    #     )
    pois = list(Poi.objects.values())
    # reviews = list(Review.objects.values())
    return JsonResponse(pois, safe=False)

def getReviewById(request):
    reviews = list(Review.objects.values())
    return JsonResponse(reviews, safe=False)

# def addPoi(request):
#     pid = request.GET.get('pid')
#     pois = Poi.objects.get(id=pid)
#     return JsonResponse(pois, safe=False)

def updateOrder(request):
    route = request.GET.get('route').split(',')
    route = list(set([int(x) for x in route]))
    print('Recieved route:', route)
    route.insert(0, 2)
    route.append(2)
    pois = list(Poi.objects.values())
    new_route = two_opt(route, pois)[1:-1]
    print('Reordered route:', new_route)
    return JsonResponse(new_route, safe=False)



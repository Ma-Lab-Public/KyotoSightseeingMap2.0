from django.db import models

# Create your models here.
class Poi(models.Model):
    pid = models.AutoField(primary_key=True)
    pname = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=18, decimal_places=15, blank=True, null=True)
    lng = models.DecimalField(max_digits=18, decimal_places=15, blank=True, null=True)

class Photo(models.Model):
    photo_id = models.BigAutoField(primary_key=True)
    path = models.CharField(max_length=511, blank=True, null=True)
    poi = models.ForeignKey(Poi, on_delete=models.CASCADE)
    lat = models.DecimalField(max_digits=18, decimal_places=15, blank=True, null=True)
    lng = models.DecimalField(max_digits=18, decimal_places=15, blank=True, null=True)

class Review(models.Model):
    review_id = models.BigAutoField(primary_key=True)
    pid = models.IntegerField(blank=True, null=True)
    text = models.CharField(max_length=511, blank=True, null=True)

'use strict';

const iconTypes = "abcd";
const iconTypesLength = iconTypes.length;

let viewModel;

function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 34.985859, lng: 135.758983},
        disableDefaultUI: false
    });
    const directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });

    viewModel = new ActionViewModel({
        map: map,
        directionsService: directionsService,
        directionsDisplay: directionsDisplay
    });
    ko.applyBindings(viewModel);

    viewModel.getPoints();
    viewModel.getReivews();
    // google.maps.event.addListener(map, 'idle', function() {
    //     viewModel.drawPoints();
    // });
}

class ActionViewModel {
    constructor(options) {
        this.map = options.map;
        this.directionsService = options.directionsService;
        this.directionsDisplay = options.directionsDisplay;
        this.infoWindow = new google.maps.InfoWindow({content:'', disableAuotPan: true, maxWidth: 3000});
        this._infoWindowPoint = null;
        this.poiData = ko.observableArray();
        this.poiPoints = ko.observableArray();
        this.reviewContents = [];
        this.routePoints = ko.observableArray();
        this.candidatePoints = [];
        this.reorderPoints = ko.observableArray();
        this.poi = ko.observable();
        this.route = ko.observable();
        this.removePoint();
        this.swap();

        // this.directionDisplays = [];
        // this.removePoint = function(point){
        //     const self = this;
        //     self.candidatePoints = self.candidatePoints.filter(function(item){
        //         return item!== point;
        //     });
        // };
    }

    openInfoWindow(point) {
        const self = this;
        self.poi = point;
        // viewModel.getReivews(self.poi.pid);
        var reviews = [];
        for(var i=0; i<self.reviewContents.length; i++){
            if(Number(self.reviewContents[i]['pid']) == Number(self.poi.pid)){
                reviews.push(self.reviewContents[i]['text']);
            }
        }
        if(reviews.length==0){
            reviews.push('No comments');
        }
        // console.log(reviews);
        let imgs = "";
        let imgsq = "";
        let reviewlist = "";
        for(var i=0; i<5; i++) {
            imgs += String.raw` <div class="col">
                                  <a href="#" class="d-block mb-4 h-100">
                                        <img style="width: 105%; max-height: 65%" class="img-fluid img-thumbnail" src="../static/data/figure_reorder/${point.pid}_${i}.jpg" alt="">
                                      </a>
                                </div>`;
        }
        for(var i=1; i<6; i++) {
            imgsq += String.raw` <div class="col">
                                  <a href="#" class="d-block mb-4 h-100">
                                        <img style="width: 105%; max-height: 65%" class="img-fluid img-thumbnail" src="../static/data/figure_question/${point.pid}_${i}.jpg" alt="">
                                      </a>
                                </div>`;
        }
        for(var i=0; i<Math.min(3,reviews.length); i++) {
            reviewlist += String.raw` 
                                  <li class="list-group-item">${reviews[i]}</li>`;
        }
        let ac = point.candidate();
        let btnActive = ac ? 'active' : '';
        const content = String.raw`
                <div class="container">
                    
                    <div class="row text-center text-lg-left">
                        <div class="col">
                            <h3>${point.pname}</h3>
                        </div>
                    </div>
                    <div class="row text-center text-lg-left">
                        <div class="col">
                            <h4>Tourist Photos</h4>
                        </div>
                    </div>
                    <div class="row text-center text-lg-left" style="padding-left: 5%; padding-right: 5%">
                        ${imgs}
                    </div>
                    
                    <div class = "row text-lg-left" style="margin-top: -50px">
                        <div class="col">
                          <a href="#" class="d-block mb-4 h-200">
                                <img style="width: 100%" class="img-fluid" src="../static/data/figure_score/${point.pid}.png" alt="">
                              </a>
                        </div>
                    </div>
                    <div class="row text-center text-lg-left">
                        <div class="col">
                            <h4>Local Residents Marked Photos</h4>
                        </div>
                    </div>
                    <div class="row text-center text-lg-left" style="padding-left: 5%; padding-right: 5%">
                        ${imgsq}
                    </div>

                    <div class="row text-center text-lg-left" style="margin-top: -20px">
                        <div class="col">
                            <h4>Local Residents Reviews</h4>
                        </div>
                    </div>
                    <div class="row text-center text-lg-left" >
                    <ul class="list-group list-group-flush">
                      ${reviewlist}
                    </ul>

                    </div>
                    <div class="row text-center text-lg-left">
                        <div class="col">
                            <div class="text-center" style="margin-top: 10px">
                                <button type="button" class="btn btn-default btn-danger ${btnActive}" data-toggle="button" aria-pressed="false" autocomplete="off" onClick="viewModel.onClickAddPoi();">Add to your trip!</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        this._infoWindowPoint = point;
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, point.marker);
    }

    getPoints(){
        const self = this;
        $.getJSON("getdata", function(response){
            self.poiData(response);

            let newPoints = response.map(function(point){
               return new PoiPoint(point);
            });

            self.poiPoints(newPoints);

        });
    }

    getReivews(pid){
        const self = this;
        $.getJSON("getreview" ,function(response){
            self.reviewContents = response;
        });
    }

    onClickAddPoi(){
        const self = this;
        this.candidatePoints.push(self.poi);
        this.reorderPoints.push(self.poi.pid);
        $.getJSON("updateorder", {'route': this.reorderPoints}, function(response){
            var r = [];
            for(var i=0; i<response.length; i++){
                for(var j=0; j<self.candidatePoints.length; j++){
                    if(self.candidatePoints[j].pid == response[i]){
                        r.push(self.candidatePoints[j]);
                    }
                }
            }
            self.candidatePoints = r;
            self.routePoints(r);

            if(self.candidatePoints.length > 1){
                viewModel.getDirection();
            }
        });

        this.infoWindow.close();

    }

    getDirection(){
        const self = this;
        let wayPoints = [];
        // self.candidatePoints.forEach(function(routePoint, index) {
        //     console.log(self.candidatePoints[index].pid);
        //     if (index === 0 || index === (self.candidatePoints.length - 1)) {
        //         return;
        //     }
        //     wayPoints.push({
        //         location: routePoint.location
        //     });
        // });
        for(var i=0; i<self.candidatePoints.length; i++){
            // console.log(self.candidatePoints[i].pid);
            if (i === 0 || i === (self.candidatePoints.length - 1)) {
                continue;
            }
            wayPoints.push({
                location: self.candidatePoints[i].location
            });
        }
        const request = {
            origin: self.candidatePoints[0].location,
            destination: self.candidatePoints[self.candidatePoints.length - 1].location,
            travelMode: google.maps.TravelMode.WALKING,
            waypoints: wayPoints
        };
        self.directionsService.route(request, function(response, status) {
            if (status == 'OK') {
                // self.clearRoute();
                self.directionsDisplay.setMap(null);
                self.directionsDisplay.setDirections(response);
                self.directionsDisplay.setMap(self.map);
                // self.route(new PoiPoint({
                //     candidatePoints: self.candidatePoints,
                //     legs: response.routes[0].legs
                // }));
            }
        });
    }

    removePoint(point){
        const self = this;
        self.candidatePoints = self.candidatePoints.filter(function(item){
            return item!== point;
        });
        self.routePoints(self.candidatePoints);

        if(this.candidatePoints.length > 1){
            viewModel.getDirection();
        }
    }

    swap(point){
        const self = this;
        if(self.candidatePoints.indexOf(point) !== 0){
            var idx = self.candidatePoints.indexOf(point);
            var temp = self.candidatePoints[idx];
            self.candidatePoints[idx] = self.candidatePoints[idx - 1];
            self.candidatePoints[idx - 1] = temp;
        }
        if(self.candidatePoints.length > 1){
            viewModel.getDirection();
        }
        self.routePoints(self.candidatePoints);
    }
}

class PoiPoint {
    constructor(options){
        const self = this;
        self.pid = options.pid;
        self.pname = options.pname;
        self.path = options.path;
        self.location = new google.maps.LatLng(options.lat, options.lng);
        self.candidate = ko.observable(false);
        self.showImg = '../static/data/figure_reorder/' + options.pid + '_2.jpg';
        self.marker = new MarkerWithLabel({
            position: self.location,
            clickable: true,
            draggable: true,
            map: viewModel.map,
            labelContent: self.pname.split(',')[1],
            labelAnchor: new google.maps.Point(-21, 3),
            labelClass: "labels",
            fontsize: 20,
        });
        // self.marker = new google.maps.Marker({
        //    position: self.location,
        //    map: viewModel.map,
        //    label: self.pname.split(',')[1],
        // });

        self.marker.addListener('click', function(e) {
            viewModel.openInfoWindow(self);
        });
    }
}


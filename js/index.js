/**
 * Club Camper Furgovw's Mobile App
 * Copyright (C) 2012, Club Camper Furgovw (furgovw.org)
 * Created by Javier Montes (@mooontes - http://mooontes.com)
 */
var app = {
    initialize: function() {
        console.log('initialize');
        this.bindEvents();
    },

    bindEvents: function() {
        console.log('bindEvents');
        document.addEventListener("deviceready", this.onDeviceReady, true);
    },

    onDeviceReady: function() {
        console.log('deviceReady!');
        furgovw.deviceready();
    }
};

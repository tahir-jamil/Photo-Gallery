import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Couchbase } from "nativescript-couchbase";
import * as camera from "nativescript-camera";
import * as ImageSource from "image-source";
import * as Permissions from "nativescript-permissions";
declare var android: any;
import * as imagepicker from "nativescript-imagepicker";

@Component({
    selector: 'app-gallary',
    templateUrl: './gallary.component.html',
    styleUrls: ['./gallary.component.css'],
    moduleId: module.id
})

export class GallaryComponent implements OnInit {

    public database: any;
    public images: Array<any>;

    imageAssets = [];
    imageSrc: any;
    thumbSize: number = 80;
    previewSize: number = 200;

    public constructor(private ref: ChangeDetectorRef) {
        this.database = new Couchbase("testing-two-couchbase");
        this.database.createView("images", "1", function (document, emitter) {
            if (document.type && document.type == "image") {
                emitter.emit(document._id, document);
            }
        });
        this.images = [];
    }

    public ngOnInit() {
        this.getImages();
    }

    getImages() {

        let rows = this.database.executeQuery("images");
        for (let i = 0; i < rows.length; i++) {
            this.images.push(ImageSource.fromBase64(rows[i].image));
        }
    }

    public takePicture() {
        Permissions.requestPermission(android.Manifest.permission.CAMERA, "Needed for connectivity status").then(() => {
            console.log("Permission granted!");
            this.capture();
        }).catch(() => {
            console.log("Permission is not granted (sadface)");
        });
    }

    public capture() {
        camera.takePicture({ width: 300, height: 300, keepAspectRatio: true, saveToGallery: true }).then((img) => {
            this.addImages(img);
            this.images.push((<any>img)._android);
        }, (err) => {
            console.log("Error -> " + err.message);
        });
    }

    addImages(image) {
        ImageSource.fromAsset(image).then((source) => {
            let base64image = source.toBase64String("jpg", 60);
            this.database.createDocument({
                "type": "image",
                "image": base64image,
                "timestamp": (new Date()).getTime()
            });
            // this.images.push(base64image);
            // this.ref.detectChanges();

        });

        // this.getImages();
    }


    //select image from device

    public onSelectMultipleTap() {
        let context = imagepicker.create({
            mode: "multiple"
        });
        this.startSelection(context);
    }

    private startSelection(context) {
        let that = this;
        context
            .authorize()
            .then(() => {
                that.imageAssets = [];
                that.imageSrc = null;
                return context.present();
            })
            .then((selection) => {
                console.log("Selection done: " + JSON.stringify(selection));
                that.imageSrc = null;

                // set the images to be loaded from the assets with optimal sizes (optimize memory usage)
                selection.forEach(function (element) {
                    element.options.width = that.previewSize;
                    element.options.height = that.previewSize;
                });

                that.imageAssets = selection;
                this.imageAssets.forEach(element => {
                    this.addImages(element);
                    this.images.push(element._android);
                });
            }).catch(function (e) {
                console.log(e);
            });
    }

}

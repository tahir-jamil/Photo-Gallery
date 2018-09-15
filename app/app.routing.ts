import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";
import { GallaryComponent } from "~/gallary/gallary.component";

const routes: Routes = [
    { path: "", redirectTo: "/gallery", pathMatch: "full" },
    { path: "gallery", component: GallaryComponent },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }

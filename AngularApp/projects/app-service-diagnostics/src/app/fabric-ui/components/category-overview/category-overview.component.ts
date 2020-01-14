import { Component, OnInit, ViewChild, TemplateRef, ElementRef, Renderer2, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { Category } from '../../../shared-v2/models/category';
import { InputRendererOptions, JsxRenderFunc, ReactWrapperComponent } from '@angular-react/core';
import { IPanelHeaderRenderer, IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { FabDropdownComponent } from '@angular-react/fabric';
import { mergeStyleSets, hiddenContentStyle, MessageBarType, FontSizes } from 'office-ui-fabric-react';

import {
    PanelType,
    IPanelStyles,
    ICalendarStrings,
    IContextualMenuProps,
    ISelection,
    Selection,
    DropdownMenuItemType,
    IDropdownOption,
    ICheckboxProps,
    IPersonaProps,
    IPeoplePickerProps
} from 'office-ui-fabric-react';
 import { Globals } from '../../../globals';
//import { Globals } from 'diagnostic-data';
//import { Globals } from 'dist/diagnostic-data/lib/services/genie.service';
//  import {} from 'office-ui-fabric-core/lib';
//  createInputJsxRenderer, createRenderPropHandler

const suffix = ' cm';

@Component({
    selector: 'category-overview',
    templateUrl: './category-overview.component.html',
    styleUrls: ['./category-overview.component.scss',
    ]
})
//extends Renderable

export class CategoryOverviewComponent implements OnInit {
    // @ViewChild(MarkdownComponent, {static: false})
    // public set markdown(v: MarkdownComponent) {
    //     this.markdownDiv = v;
    //     if (this.markdownDiv) {
    //       this.listenObj = this.renderer.listen(this.markdownDiv.element.nativeElement, 'click', (evt) => this._interceptorService.interceptLinkClick(evt, this.router, this.detector, this.telemetryService));
    //     }
    //   }
    //  @ViewChild('ms-Panel-scrollableContent', { static: false }) myScrollContainer: ElementRef;
    categoryId: string = "";
    category: Category;
    showCalendar: boolean = false;

    renderCheckboxLabel: any = {
        getProps: defaultProps => ({
            item: defaultProps["item"],
            dismissMenu: false
        }),
    };


    onMouseOverEventHandler(event: any) {
        event.preventDefault();
    }

    onClickEventHandler(event: any) {
        event.preventDefault();
    }

    getErrorMessageOnTextField(value: string): string {
        var values = value.split(":");
        var errorMessage = "";
        if (!(values.length > 1 && +values[0] <= 24 && +values[1] <= 59)) {
            errorMessage = `Invalid time`;
        }
        return errorMessage;
    }

    onValidate(value: string, event: Event): string | void {
        value = this._removeSuffix(value, suffix);
        if (value.trim().length === 0 || isNaN(+value)) {
            return '0' + suffix;
        }

        return String(value) + suffix;
    }

    private _hasSuffix(value: string, suffix: string): Boolean {
        const subString = value.substr(value.length - suffix.length);
        return subString === suffix;
    }

    private _removeSuffix(value: string, suffix: string): string {
        if (!this._hasSuffix(value, suffix)) {
            return value;
        }

        return value.substr(0, value.length - suffix.length);
    }


    // @ViewChild('panelTitle', { static: true }) navigationContentTemplate: TemplateRef<any>;
    // @ViewChild("headerTemplate", { static: true }) headerTemplate: TemplateRef<any>;
    // @ViewChild('tpl', { static: true }) tpl: TemplateRef<any>;

    constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _categoryService: CategoryService, private globals: Globals) {
    }

    ngAfterViewInit() {
        var x = document.getElementById("custom");
        console.log("x", x);
        x.addEventListener("click", function (event) {
            // console.log("I am clicking");
            event.preventDefault()
        });
    }

    openMessageBar: boolean = false;

    ngOnInit() {
        // document.getElementById("custom").addEventListener("click", function(event){
        //     // console.log("I am clicking");
        //     event.preventDefault()
        //   });


        this.categoryId = this._activatedRoute.parent.snapshot.params.category;

        this._categoryService.categories.subscribe(categorys => {
            this.category = categorys.find(category => this.categoryId === category.id);
        });

        console.log("categoryId", this.categoryId);



        // document.getElementById('close').onclick = () => {
        //     this.openPanel = false;
        //     console.log("this.isOpen", this.openPanel);
        // }



        // this.navigationContent =  {
        //     render: defaultProps => ({
        //       ...defaultProps,
        //       onRenderNavigationContent: (props, defaultRender) => return (
        //         <>
        //     <SearchBox placeholder="Search here..." styles={searchboxStyles} ariaLabel="Sample search box. Does not actually search anything." />
        //     {
        //     ${defaultRender!(props)}
        //   </>)
        //     }),
        //   };

        //     this.navigationContent =   (props, defaultRender) => {
        //         `<>
        //     <SearchBox placeholder="Search here..." styles={searchboxStyles} ariaLabel="Sample search box. Does not actually search anything." />
        //     {// This custom navigation still renders the close button (defaultRender).
        //     // If you don't use defaultRender, be sure to provide some other way to close the panel.
        //     ${defaultRender!(props)}
        //   </>`;
        // };
        console.log("routes", this._activatedRoute.parent);
        console.log("categoryId", this.categoryId);
    }
}

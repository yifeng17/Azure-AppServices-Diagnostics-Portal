import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InputRendererOptions, JsxRenderFunc, ReactWrapperComponent} from '@angular-react/core';
import { IPanelHeaderRenderer, IPanelProps } from 'office-ui-fabric-react/lib/Panel';

//  createInputJsxRenderer, createRenderPropHandler


@Component({
  selector: 'category-overview',
  templateUrl: './category-overview.component.html',
  styleUrls: ['./category-overview.component.scss']
})
//extends Renderable
export class CategoryOverviewComponent implements OnInit   {

  categoryId: string = "";
  isOpen: boolean = true;
  //navigationContent: InputRendererOptions<IPanelProps>;
//  navigationContent: RenderPropContext<IPanelProps>;
navigationContent: (() => HTMLElement);
  isLightDismiss: boolean = true;
  constructor(private _activatedRoute: ActivatedRoute) {


    // this._activatedRoute.paramMap.subscribe(params => {
    //     console.log("category params", params);
    //     this.categoryId = params.get('category');
    //   });
  }

  ngOnInit() {
    this.categoryId = this._activatedRoute.parent.snapshot.params.category;
    let elem = document.createElement('div') as HTMLElement
    // this.navigationContent = useConstCallback((props, defaultRender) => (
    //     <>
    //       <SearchBox placeholder="Search here..." styles={searchboxStyles} ariaLabel="Sample search box. Does not actually search anything." />
    //       {// This custom navigation still renders the close button (defaultRender).
    //       // If you don't use defaultRender, be sure to provide some other way to close the panel.
    //       defaultRender!(props)}
    //     </>
    //   ));

    // This custom navigation still renders the close button (defaultRender).
        // If you don't use defaultRender, be sure to provide some other way to close the panel.


        // export interface IRenderFunction<P> {
        //     (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
        // }


        // this.navigationContent = {
        //     render: defaultProps => {
        //         (<h1>Hello World</h1>)
        //         // {
        //         // ${defaultRender!(props)}
        //             // <>
        //     //   </>)
        //    //   label: defaultProps.label,
        //     //  onRenderNavigationContent: createInputJsxRenderer()
        //     },
        //   };

        // this.navigationContent = {
        //     getProps: defaultProps => ({
        //       ...defaultProps,
        //    //   label: defaultProps.label,
        //       onRenderNavigationContent: ()=>{
        //           document.createElement('div') as HTMLElement;
        //         // (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
        //       }
        //     }),
        //   };

          this.navigationContent = ()=>{
              let panelTitle =  document.createElement('div') as HTMLElement;
              panelTitle.style.position = 'absolute';
              panelTitle.style.left = '25px';
              panelTitle.style.right = '32px';
              panelTitle.style.top = '0px';
              panelTitle.style.height = '27px';
              panelTitle.style.fontFamily = "Segoe UI";
              panelTitle.style.fontSize = "18px";
              panelTitle.style.lineHeight = "24px";
              panelTitle.style.display = "flex";
              panelTitle.style.alignItems = "flex-end";
              panelTitle.innerHTML= "Hi my name is Genie"
            return panelTitle;
          // (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
        };

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

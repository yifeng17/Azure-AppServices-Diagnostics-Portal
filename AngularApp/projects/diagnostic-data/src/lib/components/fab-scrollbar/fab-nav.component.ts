import { InputRendererOptions, JsxRenderFunc, ReactWrapperComponent } from '@angular-react/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { INavProps, INavLink, INav } from 'office-ui-fabric-react';
import { IPanelHeaderRenderer, IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { IScrollablePaneProps } from 'office-ui-fabric-react/lib/ScrollablePane';


@Component({
  selector: 'fab-scroll-panel',
  exportAs: 'fabScrollPanel',
  template: `
    <ScrollablePane
    #reactNode
    [componentRef]="componentRef"
    [isOpen]="isOpen"
    [hasCloseButton]="hasCloseButton"
    [isLightDismiss]="isLightDismiss"
    [isHiddenOnDismiss]="isHiddenOnDismiss"
    [isBlocking]="isBlocking"
    [isFooterAtBottom]="isFooterAtBottom"
    [headerText]="headerText"
    [styles]="styles"
    [theme]="theme"
    [className]="className"
    [type]="type"
    [customWidth]="customWidth"
    [closeButtonAriaLabel]="closeButtonAriaLabel"
    [headerClassName]="headerClassName"
    [elementToFocusOnDismiss]="elementToFocusOnDismiss"
    [ignoreExternalFocusing]="ignoreExternalFocusing"
    [forceFocusInsideTrap]="forceFocusInsideTrap"
    [firstFocusableSelector]="firstFocusableSelector"
    [focusTrapZoneProps]="focusTrapZoneProps"
    [layerProps]="layerProps"
    [componentId]="componentId"
    [RenderHeader]="renderHeader && onRenderHeader"
    [RenderNavigation]="renderNavigation && onRenderNavigation"
    [RenderNavigationContent]="renderNavigationContent && onRenderNavigationContent"
    [RenderBody]="renderBody && onRenderBody"
    [RenderFooter]="renderFooter && onRenderFooter"
    [RenderFooterContent]="renderFooterContent && onRenderFooterContent"
    [Dismiss]="onDismissHandler"
    (onOpen)="onOpen.emit($event)"
    (onOpened)="onOpened.emit($event)"
    (onDismissed)="onDismissed.emit($event)"
    (onLightDismissClick)="onLightDismissClick.emit($event)"
  >
    <ReactContent><ng-content></ng-content></ReactContent>
  </ScrollablePane>
`,
  styles: ['react-renderer'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabScrollPanelComponent extends ReactWrapperComponent<IPanelProps> implements OnInit {
    @ViewChild('reactNode', { static: true }) protected reactNodeRef: ElementRef;

    @Input() componentRef?: IScrollablePaneProps['componentRef'];
    @Input() initialScrollPosition?: IScrollablePaneProps['initialScrollPosition'];
    @Input() scrollbarVisibility?: IScrollablePaneProps['scrollbarVisibility'];
    @Input() styles?: IScrollablePaneProps['styles'];
    @Input() theme?: IScrollablePaneProps['theme'];

    @Input() renderNavigation?: InputRendererOptions<IPanelProps>;
    @Input() renderNavigationContent?: InputRendererOptions<IPanelProps>;
    @Input() renderHeader?: InputRendererOptions<IPanelHeaderRenderContext>;
    @Input() renderBody?: InputRendererOptions<IPanelProps>;
    @Input() renderFooter?: InputRendererOptions<IPanelProps>;
    @Input() renderFooterContent?: InputRendererOptions<IPanelProps>;

    @Output() readonly onLightDismissClick = new EventEmitter<void>();
    @Output() readonly onOpen = new EventEmitter<void>();
    @Output() readonly onOpened = new EventEmitter<void>();
    @Output() readonly onDismiss = new EventEmitter<{ ev?: Event }>();
    @Output() readonly onDismissed = new EventEmitter<void>();

    private _renderHeader: JsxRenderFunc<IPanelHeaderRenderContext>;
    onRenderNavigation: (props?: IPanelProps, defaultRender?: JsxRenderFunc<IPanelProps>) => JSX.Element;
    onRenderNavigationContent: (props?: IPanelProps, defaultRender?: JsxRenderFunc<IPanelProps>) => JSX.Element;
    onRenderBody: (props?: IPanelProps, defaultRender?: JsxRenderFunc<IPanelProps>) => JSX.Element;
    onRenderFooter: (props?: IPanelProps, defaultRender?: JsxRenderFunc<IPanelProps>) => JSX.Element;
    onRenderFooterContent: (props?: IPanelProps, defaultRender?: JsxRenderFunc<IPanelProps>) => JSX.Element;


  constructor(elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef, renderer: Renderer2) {
    super(elementRef, changeDetectorRef, renderer);
    this.onLinkClickHandler = this.onLinkClickHandler.bind(this);
    this.onLinkExpandClickHandler = this.onLinkExpandClickHandler.bind(this);
  }

  ngOnInit() {
    this.onRenderNavigation = this.createRenderPropHandler(this.renderNavigation);
    this.onRenderNavigationContent = this.createRenderPropHandler(this.renderNavigationContent);
    this._renderHeader = this.createInputJsxRenderer(this.renderHeader);
    this.onRenderBody = this.createRenderPropHandler(this.renderBody);
    this.onRenderFooter = this.createRenderPropHandler(this.renderFooter);
    this.onRenderFooterContent = this.createRenderPropHandler(this.renderFooterContent);
  }

  onLinkClickHandler(event: React.MouseEvent<HTMLElement>, link?: INavLink): void {
    event.preventDefault();
    this.onLinkClick.emit({
      event: event.nativeEvent,
      link: link
    });
  }

  onLinkExpandClickHandler(event: React.MouseEvent<HTMLElement>, link?: INavLink): void {
    this.onLinkExpandClick.emit({
      event: event.nativeEvent,
      link: link
    });
  }
}

/**
 * Counterpart of `IPanelHeaderRenderer`.
 */
export interface IPanelHeaderRenderContext {
    props?: IPanelProps;
    headerTextId?: string | undefined;
  }


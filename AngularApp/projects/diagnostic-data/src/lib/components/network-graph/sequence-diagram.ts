import * as joint from 'jointjs';

declare module 'jointjs' {
    namespace shapes {
        namespace sd {
            class RoleGroup extends joint.shapes.standard.Rectangle {
                fitRoles(): void;
            }

            class Role extends joint.shapes.standard.Rectangle {
                setName(name:string):void;
                setIcon(filename:string):void;
            }

            class Lifeline extends joint.shapes.standard.Link {
                attachToRole(role:any, maxY:number):void;
            }

            class LifeSpan extends joint.dia.Link {
                attachToMessages(from:any, to:any):void;
            }

            class Message extends joint.shapes.standard.Link {
                setStart(y:number):void;
                setFromTo(from:any, to:any):void;
                setDescription(description:string, limit:number):void;
                setColor(color:string):void;
            }
        }
    }
}

export class SequenceDiagram{
    private paperWidth:number;
    private paperHeight:number;
    paper:joint.dia.Paper;
    graph:joint.dia.Graph;
    currentRoleXPosition = 25;
    currentMsgYPosition = 50;
    RoleMap: Map<number, joint.shapes.sd.Lifeline>;

    constructor(width = 800, height = 600){
        this.paperWidth = width;
        this.paperHeight = height;
        let dia = joint.dia;
        let sd = joint.shapes.sd;
        let paperElement = jQuery("#network-graph-paper");
        let paperWidth = this.paperWidth

        this.graph = new dia.Graph();
        this.paper = new dia.Paper({
            el: paperElement,
            width: this.paperWidth,
            height: this.paperHeight,
            model: this.graph,
            frozen: true,
            async: true,
            sorting: dia.Paper.sorting.APPROX,
            defaultConnectionPoint: { name: 'rectangle' },
            background: { color:  '#F3F7F6' },
            moveThreshold: 5,
            restrictTranslate: function(elementView) {
                var element = elementView.model;
                var padding = (element.isEmbedded()) ? 20 : 10;
                return {
                    x: padding,
                    y: element.getBBox().y,
                    width: paperWidth - 2 * padding,
                    height: 0
                };
            },
            interactive: function(cellView) {
                var cell = cellView.model;
                return (cell.isLink())
                    ? { linkMove: false, labelMove: false }
                    : true;
            }
        });

        //this.paper.el.style.border = '1px solid #E5E5E5';

        this.paper.on('link:pointermove', function(linkView, _evt, _x, y) {
            var link = linkView.model;
            if (link instanceof sd.Message) {
                var sView = linkView.sourceView;
                var tView = linkView.targetView;
                var padding = 20;
                var minY = Math.max(tView.sourcePoint.y - sView.sourcePoint.y, 0) + padding;
                var maxY = sView.targetPoint.y - sView.sourcePoint.y - padding;
                link.setStart(Math.min(Math.max(y - sView.sourcePoint.y, minY), maxY));
            }
        });
        
        this.RoleMap = new Map<number, joint.shapes.sd.Lifeline>();
    }

    addRoles(roles:Role[]):void{
        const y = 10, interval = 200;
      
        roles.map((i, idx):[Role, number]=>[i, idx])
            .sort((a,b)=>a[0].position==b[0].position?a[1]-b[1]:a[0].position-b[0].position) //stable sort
            .map(t=>t[0])
            .forEach(role=>{
            let sdRole = new joint.shapes.sd.Role({ position: { x: this.currentRoleXPosition, y: y }})
            this.currentRoleXPosition += interval;
            let charCnt = 0, name = "";
            role.name.split(" ").forEach(n=>{
                if(name.length + n.length > 20 + charCnt){
                    charCnt = name.length;
                    name += "\r\n" + n;
                }
                else{
                    name += " " + n;
                }
            });
            if(role.roleType == 1){
                sdRole.setIcon("browser.svg");
            }
            sdRole.setName(name);
            sdRole.addTo(this.graph);

            let lifeline = new joint.shapes.sd.Lifeline();
            lifeline.attachToRole(sdRole, this.paperHeight);
            lifeline.addTo(this.graph);
            this.RoleMap[role.id] = lifeline;
        });

        this.paperWidth = this.currentRoleXPosition - 65;
        this.paper.setDimensions(this.paperWidth, this.paperHeight);
    }

    addMessages(messages:Message[]):void{
        const interval = 45, msgLimitLength = 35;
        messages.forEach(msg=>{
            var message = new joint.shapes.sd.Message();
            let lifeline1 = this.RoleMap[msg.startRoleId];
            let lifeline2 = this.RoleMap[msg.endRoleId];
            message.setFromTo(lifeline1, lifeline2);
           
            message.setStart(this.currentMsgYPosition);
            this.currentMsgYPosition += interval;
            if(msg.status==0){
                message.setColor("red");
            }
            message.setDescription(msg.text, msgLimitLength);
            message.addTo(this.graph);
        });

        this.paperHeight = this.currentMsgYPosition + 100;
        this.paper.setDimensions(this.paperWidth, this.paperHeight);
    }

    unfreeze():void{
        this.paper.unfreeze();
    }
}

export class Role{
    name:string;
    position: number;
    id:number;
    roleType:number;

    public constructor(init?:Partial<Role>) {
        Object.assign(this, init);
    }
}

export class Message{
    text:string;
    status:number;
    startRoleId:number;
    endRoleId:number;

    public constructor(init?:Partial<Message>) {
        Object.assign(this, init);
    }
}

(function initialize(){
    const RoleGroup = joint.shapes.standard.Rectangle.define('sd.RoleGroup', {
        z: 1,
        attrs: {
            body: {
                stroke: '#DDDDDD',
                strokeWidth: 1,
                fill: '#F9FBFA'
            }
        }
    }, {
        fitRoles: function() {
            this.fitEmbeds({ padding: 10 });
        }
    });
    
    const Role = joint.shapes.standard.EmbeddedImage.define('sd.Role', {
        z: 2,
        size: { width: 100, height: 70 },
        attrs: {
            image:{
                xlinkHref: "assets/img/server.svg",
                refWidth:"80%",
                refY: 10
            },
            body: {
                stroke: 'none',
                strokeWidth: 0,
                fill: 'none',
                rx: 2,
                ry: 2
            },
            label: {
                fontSize: 12,
                fontFamily: 'sans-serif',
                textAnchor: 'middle',
                refY:70,
                fontWeight:"bold"
            }
        }
    }, {
        setName: function(name) {
            this.attr(['label', 'text'], name);
        },
        setIcon: function(filename:string){
            this.attributes.attrs.image.xlinkHref = `assets/img/${filename}`;
        }
    });
    
    const Lifeline = joint.shapes.standard.Link.define('sd.Lifeline', {
        z: 3,
        attrs: {
            line: {
                stroke: '#A0A0A0',
                strokeWidth: 1,
                strokeDasharray: '5,2',
                targetMarker: null
            }
        }
    }, {
        attachToRole: function(role, maxY) {
            const roleCenter = role.getBBox().center();
            this.set({
                source: { id: role.id },
                target: { x: roleCenter.x, y: maxY }
            });
            role.embed(this);
        }
    });
    
    const LifeSpan = joint.dia.Link.define('sd.LifeSpan', {
        z: 4,
        attrs: {
            line: {
                connection: true,
                stroke: '#222222',
                strokeWidth: 2
            },
            icon: {
                atConnectionRatioIgnoreGradient: 0.5
            }
        }
    }, {
        markup: [{
            tagName: 'path',
            selector: 'line',
            attributes: {
                'fill': 'none',
                'pointer-events': 'none'
            }
        }, {
            tagName: 'g',
            selector: 'icon',
            children: [{
                tagName: 'circle',
                attributes: {
                    'r': 12,
                    'fill': '#222222'
                }
            }, {
                tagName: 'path',
                attributes: {
                    'd': 'M -3 -5 3 -5 3 -2 -3  2 -3 5 3 5 3 2 -3 -2 Z',
                    'stroke': '#FFFFFF',
                    'stroke-width': 1,
                    'fill': 'none'
                }
            }]
        }],
        attachToMessages: function(from, to) {
            this.source(from, { anchor: { name: 'connectionRatio', args: { ratio: 1 }}});
            this.target(to, { anchor: { name: 'connectionRatio', args: { ratio: 0 }}});
        }
    });
    
    const Message = joint.shapes.standard.Link.define('sd.Message', {
        z: 5,
        source: { anchor: { name: 'connectionLength' }},
        target: { anchor: { name: 'connectionPerpendicular' }},
        attrs: {
            line: {
                stroke: '#4666E5',
                sourceMarker: {
                    'type': 'path',
                    'd': 'M -3 -3 -3 3 3 3 3 -3 z',
                    'stroke-width': 3
                }
            },
            wrapper: {
                strokeWidth: 20,
                cursor: 'grab'
            },
        },
        color: "#4666E5"
    }, {
        defaultLabel: {
            markup: [{
                tagName: 'rect',
                selector: 'labelBody'
            }, {
                tagName: 'text',
                selector: 'labelText'
            }],
            attrs: {
                labelBody: {
                    ref: 'labelText',
                    refWidth: '100%',
                    refHeight: '100%',
                    refWidth2: 20,
                    refHeight2: 10,
                    refX: -10,
                    refY: -5,
                    rx: 2,
                    ry: 2,
                    fill: '#4666E5'
                },
                labelText: {
                    fill: '#FFFFFF',
                    fontSize: 8,
                    fontFamily: 'sans-serif',
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle',
                    cursor: 'grab'
                }
            }
        },
        setStart: function(y) {
            this.prop(['source', 'anchor', 'args', 'length'], y);
        },
        setFromTo: function(from, to) {
            this.prop({
                source: { id: from.id },
                target: { id: to.id }
            });
        },
        setDescription: function(description:string, limit:number) {
            if(description.length>limit){
                this.prop({attrs:{root:{title: description}}});
                description = description.substr(0,limit-3)+"...";
                //description = description.match(new RegExp(`.{1,${limit}}`, 'g')).reduce((s, i)=> s+"\r\n"+i);
            }
            this.labels([{ attrs: { labelBody: {fill: this.attributes.color}, labelText: { text: description }}}]);
        },
        setColor: function(color: string){
            this.prop({attrs:{line:{stroke: color}}, color: color});
            for(let i in this.attributes.labels){
                this.attributes.labels[i].attrs.labelBody = {fill: color};
            }
        }
    });
    
    (<any>Object).assign(joint.shapes, {
        sd: {
            RoleGroup,
            Role,
            Lifeline,
            LifeSpan,
            Message
        }
    });
})();


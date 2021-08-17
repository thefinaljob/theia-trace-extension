import * as React from 'react';
import { Trace } from 'tsp-typescript-client';
import { signalManager, Signals } from '@trace-viewer/base/lib/signals/signal-manager';

interface MenuItemProps {
    index: number;
    experimentName: string;
    experimentUUID: string;
    traces: Trace[];
    onTabNameChange: (tabEditingOpen: string, index: number) => void;
    menuItemTraceContainerClassName: string;
    handleClickEvent: (event: React.MouseEvent<HTMLDivElement>, experimentName: string) => void;
    handleContextMenuEvent: (event: React.MouseEvent<HTMLDivElement>, experimentUUID: string) => void;
}
interface MenuItemState {
    editingTab: boolean;
    expirementNameState: string;
}

export class MenuItemTrace extends React.Component<MenuItemProps, MenuItemState> {

    private wrapper: React.RefObject<HTMLDivElement>;

    constructor(menuItemProps: MenuItemProps) {
        super(menuItemProps);
        this.state = {
            expirementNameState: this.props.experimentName,
            editingTab: false
        };
        this.wrapper = React.createRef();
    }

    componentDidMount(): void {
        document.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount(): void {
        document.removeEventListener('click', this.handleClickOutside);
    }

    handleClickOutside = (event: Event): void => {
        const node = this.wrapper.current;
        if (!node || !node.contains(event.target as Node)) {
            this.setState({
                editingTab: false
            });
        }
    };

    protected handleEnterPress(event: React.KeyboardEvent<HTMLInputElement>): void{
        if (event.key === 'Enter'){
            this.setState({
                editingTab: false
            });
            this.props.onTabNameChange(this.state.expirementNameState, this.props.index);
        }
    }

    protected changeText(event: React.ChangeEvent<HTMLInputElement>): void{
        const newName = event.target.value.toString();
        this.setState({
            expirementNameState : newName
        });
        signalManager().fireTabChangedSignal(newName, this.props.experimentUUID);
    }
    protected inputTab(): React.ReactNode {
        return <input name="tab-name" className="theia-input"
            defaultValue = {this.state.expirementNameState}
            onChange = {e => (this.changeText(e))}
            onClick = {e => e.stopPropagation()}
            onKeyPress = {e => (this.handleEnterPress(e))}
            maxLength = {50}
        />;
    }
    protected renderEditTraceName(event: React.MouseEvent<HTMLDivElement>): void {
        this.setState(() => ({
            editingTab: true
        }));
        event.stopPropagation();
    }
    protected renderTracesForExperiment = (): React.ReactNode => this.doRenderTracesForExperiment();
    protected doRenderTracesForExperiment(): React.ReactNode {
        const tracePaths = this.props.traces;
        return (
            <div className='trace-element-path-container'>
                {tracePaths.map(trace => (
                    <div className='trace-element-path child-element' id={trace.UUID} key={trace.UUID}>
                        {` > ${trace.name}`}
                    </div>
                ))}
            </div>
        );
    }
    protected subscribeToExplorerEvents(): void {
        signalManager().on(Signals.OUTPUT_ADDED, this.changeText);
    }

    render(): JSX.Element {
        return (
            <div className={this.props.menuItemTraceContainerClassName}
            id={`${this.props.menuItemTraceContainerClassName}-${this.props.index}`}
            onClick={event => { this.props.handleClickEvent(event, this.props.experimentUUID); }}
            onContextMenu={event => { this.props.handleContextMenuEvent(event, this.props.experimentUUID); }}
            data-id={`${this.props.index}`}
            ref={this.wrapper}>
            <div className='trace-element-container'>
                <div className='trace-element-info' >
                    <h4 className='trace-element-name'>
                        {this.state.editingTab ? this.inputTab() : this.state.expirementNameState}
                        <div className='edit-trace-name' onClick={e => {this.renderEditTraceName(e);}}>
                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                width="16px" height="16px" viewBox="0 0 512 512" enableBackground="new 0 0 512 512" xmlSpace="preserve">
                                <g>
                                    <path fill="#020202" d="M422.953,176.019c0.549-0.48,1.09-0.975,1.612-1.498l21.772-21.772c12.883-12.883,12.883-33.771,0-46.654
                                        l-40.434-40.434c-12.883-12.883-33.771-12.883-46.653,0l-21.772,21.772c-0.523,0.523-1.018,1.064-1.498,1.613L422.953,176.019z"/>
                                    <polygon fill="#020202" points="114.317,397.684 157.317,440.684 106.658,448.342 56,456 63.658,405.341 71.316,354.683 	"/>
                                    <polygon fill="#020202" points="349.143,125.535 118.982,355.694 106.541,343.253 336.701,113.094 324.26,100.653 81.659,343.253
                                        168.747,430.341 411.348,187.74 	"/>
                                </g>
                            </svg>
                        </div>
                    </h4>
                    { this.renderTracesForExperiment() }
                </div>
                {/* <div className='trace-element-options'>
                    <button className='share-context-button' onClick={this.handleShareButtonClick.bind(this, props.index)}>
                        <FontAwesomeIcon icon={faShareSquare} />
                    </button>
                </div> */}
            </div>
        </div>
        );
    }
}

/* eslint-disable class-methods-use-this */

class SearchTable {
  constructor(tableId, config) {
    if (!config) throw 'No config provided';
    if (!tableId) throw 'No tableId provided';
    this.table = document.getElementById(tableId);
    if (!this.table) throw 'Cant find table with ID that was provided';
    this.config = config;
    this.tag = null;
    this.items = [];
    this.sort = {};
    this.commands = {};
    this.init();
  }

  init() {
    this.table.innerHTML = '';
    this.renderHeader();
    this.renderBody();
  }

  renderHeader() {
    if (!this.config.columns) throw 'No columns are indicated in the config';
    this.thead = this._create('thead', this.table);
    this.config.columns.forEach((colConfig) => {
      let classes = [];
      if (colConfig.type === 'date') classes = ['text-center'];
      else if (colConfig.type === 'number') classes = ['text-right'];
      else classes = ['text-left', 'text-bold'];
      const th = this._create('th', this.thead, colConfig.header, classes);
      if (colConfig.sortBy) {
        const _t = this;
        const iconClasses = ['icon', 'active-sort-field'];
        if (colConfig.defaultSorted) {
          iconClasses.push('icon-chevron-down');
          _t.sort = { type: -1, key: colConfig.sortBy };
        }
        const icon = this._create('span', th, '', iconClasses);
        th.addEventListener('click', () => {
          if (_t.canSort === false) return;
          _t.canSort = false;
          const currentSortedField = _t.thead.querySelector('.active-sort-field');
          currentSortedField.classList.remove('active-sort-field');
          currentSortedField.classList.remove('icon-chevron-up');
          currentSortedField.classList.remove('icon-chevron-down');
          icon.classList.add('active-sort-field');

          if (_t.sort.type === 1) {
            _t.sort = { type: -1, key: colConfig.sortBy };
            icon.classList.add('icon-chevron-down');
          } else {
            _t.sort = { type: 1, key: colConfig.sortBy };
            icon.classList.add('icon-chevron-up');
          }
          _t.onSort(_t.sort);
        });
      }

      if (colConfig.width) th.style.width = colConfig.width;
    });
  }

  renderBody() {
    this.tbody = this._create('tbody', this.table);
    this.tbody.onscroll = (e) => {
      if (this.tbody.scrollTop / (this.tbody.scrollHeight - this.tbody.offsetHeight) > 0.8) {
        this.onLoadMore();
      }
    };
  }

  // eslint-disable-next-line class-methods-use-this
  _cropImage(url, options) {
    if (!url) {
      return '';
    }
    return buildfire.imageLib.cropImage(url, options);
  }

  search(filter) {
    this.tbody.innerHTML = '';
    this._create('tr', this.tbody, '<td colspan="99"> searching...</td>', [
      'loadingRow',
    ]);
    this.filter = filter;
    this._fetchPageOfData(this.filter, 0);
  }

  renderData(items) {
    this.tbody.innerHTML = '';
    items.forEach((item) => {
      this.renderRow(item);
    });
  }

  clearData() {
    this.tbody.innerHTML = '';
    this.items = [];
  }

  _onCommand(obj, tr, command) {
    if (this.commands[command]) {
      this.commands[command](obj, tr);
    } else {
      console.log(`Command ${command} does not have any handler`);
    }
  }

  getImage(obj) {
    const div = document.createElement('div');
    if (obj.listImage) {
      const img = document.createElement('img');
      img.src = this._cropImage(obj.listImage, {
        width: 40,
        height: 40,
      });

      div.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.className = 'add-icon text-success';
      span.innerHTML = '+';
      div.appendChild(span);
    }

    return div.innerHTML;
  }

  renderRow(obj, tr) {
    if (tr) {
      // used to update a row
      tr.innerHTML = '';
    } else {
      tr = this._create('tr', this.tbody);
    }
    this.config.columns.forEach((colConfig) => {
      let classes = [];
      if (colConfig.type === 'date') classes = ['text-center'];
      else if (colConfig.type === 'number') classes = ['text-right'];
      else classes = ['text-left'];
      let td;

      if (colConfig.type === 'command') {
        td = this._create(
          'td',
          tr,
          `<button class="btn btn-link">${colConfig.text}</button>`,
          ['editColumn'],
        );
        td.onclick = (event) => {
          event.preventDefault();
          this._onCommand(obj, tr, colConfig.command);
        };
      } else if (colConfig.type === 'image') {
        td = this._create(
          'td',
          tr,
          `<div class="icon-holder">${this.getImage(obj)}</div>`,
          ['imageColumn'],
        );
        td.onclick = () => {
          this.onImageClick(obj, tr);
        };
      } else {
        let output = '';
        try {
          // needed for the eval statement next
          const data = obj;
          output = eval(`\`${colConfig.data}\``);
        } catch (error) {
          console.log(error);
        }
        td = this._create('td', tr, output, [...classes, 'ellipsis']);
      }

      if (colConfig.width) td.style.width = colConfig.width;
    });

    const t = this;
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex-row justify-content-end search-table-actions';

    let editClassName = 'btn btn--icon icon icon-pencil primary margin-left-five';
    if (!t.config.options.showEditButton) {
      editClassName += ' hidden';
    }
    const editBtn = document.createElement('button');
    editBtn.className = editClassName;
    actionsDiv.appendChild(editBtn);

    let deleteClassName = 'btn btn--icon icon danger icon-cross2 danger margin-left-five';
    if (!t.config.options.showDeleteButton) {
      deleteClassName += ' hidden';
    }

    if (t.config.options.customActions && t.config.options.customActions.length) {
      t.config.options.customActions.forEach((_action) => {
        const actionBtn = document.createElement('button');
        actionBtn.className = `btn btn--icon icon margin-left-five ${_action.icon} ${_action.color}`;
        actionsDiv.appendChild(actionBtn);
        actionBtn.onclick = () => {
          t.onActionClicked(_action.actionType, obj, tr);
        };
      });
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = deleteClassName;
    actionsDiv.appendChild(deleteBtn);

    editBtn.onclick = () => {
      t.onActionClicked('edit', obj, tr);
    };
    deleteBtn.onclick = () => {
      t.onActionClicked('delete', obj, tr);
    };

    t.onRowAdded(obj, tr);
  }

  onSearchSet(options) {
    return options;
  }

  onRowAdded(obj, tr) {}

  onActionClicked(actionType, obj, tr) {}

  onSort(sort) {}

  onCopy(obj, tr) {}

  onCopyMouseOut(obj, tr) {}

  onImageClick(obj, tr) {}

  onLoadMore() {}

  onShowReport() {}

  onCommand(command, cb) {
    this.commands[command] = cb;
  }

  _create(elementType, appendTo, innerHTML, classNameArray) {
    const e = document.createElement(elementType);
    if (innerHTML) e.innerHTML = innerHTML;
    if (Array.isArray(classNameArray)) classNameArray.forEach((c) => e.classList.add(c));
    if (appendTo) appendTo.appendChild(e);
    return e;
  }
}
